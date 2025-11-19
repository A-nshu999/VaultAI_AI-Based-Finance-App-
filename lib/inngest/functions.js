import { sendEmail } from "@/actions/send-email";
import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";

export const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" }, // Runs every 6 hours
  async ({ step }) => {
    
    // 1️⃣ FETCH ALL BUDGETS + USERS + THEIR DEFAULT ACCOUNT
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    // 2️⃣ PROCESS EACH USER'S BUDGET
    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {

        // Get monthly expense range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // 3️⃣ CALCULATE EXPENSES
        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        });

        const totalExpenses = expenses._sum.amount ?? 0;
        const budgetAmount = budget.amount;
        
        // Convert Decimal to number if needed
        const totalExpensesNum = typeof totalExpenses === 'object' && totalExpenses.toNumber 
          ? totalExpenses.toNumber() 
          : Number(totalExpenses);
        const budgetAmountNum = typeof budgetAmount === 'object' && budgetAmount.toNumber
          ? budgetAmount.toNumber()
          : Number(budgetAmount);
        
        const percentUsed = (totalExpensesNum / budgetAmountNum) * 100;

        // 4️⃣ CHECK IF SHOULD SEND ALERT
        const shouldSendAlert =
          percentUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()));

        if (!shouldSendAlert) return;

        // 5️⃣ SEND EMAIL
        await sendEmail({
          to: budget.user.email,
          subject: `⚠️ Budget Alert for ${defaultAccount.name}`,
          react: EmailTemplate({
            userName: budget.user.name,
            type: "budget-alert",
            data: {
              percentageUsed: percentUsed,
              budgetAmount: budgetAmountNum,
              totalExpenses: totalExpensesNum,
              accountName: defaultAccount.name,
            },
          }),
        });

        // 6️⃣ UPDATE ALERT TIMESTAMP
        await db.budget.update({
          where: { id: budget.id },
          data: { lastAlertSent: new Date() },
        });
      });
    }
  }
);

// Helper function
function isNewMonth(lastDate, currentDate) {
  return (
    lastDate.getMonth() !== currentDate.getMonth() ||
    lastDate.getFullYear() !== currentDate.getFullYear()
  );
}
