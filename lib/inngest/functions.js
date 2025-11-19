import { sendEmail } from "@/actions/send-email";
import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";

export const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" }, // every 6 hours
  async ({ step }) => {
    
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: { isDefault: true },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        });

        const totalExpenses = expenses._sum.amount?.toNumber?.() ?? 0;
        const budgetAmount = budget.amount?.toNumber?.() ?? 0;

        const percentUsed = (totalExpenses / budgetAmount) * 100;

        const shouldSendAlert =
          percentUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()));

        if (!shouldSendAlert) return;

        await sendEmail({
          to: budget.user.email,
          subject: `⚠️ Budget Alert for ${defaultAccount.name}`,
          react: EmailTemplate({
            userName: budget.user.name || "",
            type: "budget-alert",
            data: {
              percentageUsed: percentUsed,
              budgetAmount,
              totalExpenses,
              accountName: defaultAccount.name,
            },
          }),
        });

        await db.budget.update({
          where: { id: budget.id },
          data: { lastAlertSent: new Date() },
        });
      });
    }
  }
);

function isNewMonth(lastDate, now) {
  return (
    lastDate.getMonth() !== now.getMonth() ||
    lastDate.getFullYear() !== now.getFullYear()
  );
}
