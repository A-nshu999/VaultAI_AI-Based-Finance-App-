"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/* Utility to safely convert Prisma Decimal to number */
function toNumberSafe(val) {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "string") return Number(val) || 0;
  if (typeof val === "object" && typeof val.toNumber === "function") {
    try {
      return val.toNumber();
    } catch {
      return Number(String(val)) || 0;
    }
  }
  return Number(val) || 0;
}

/* -------------------------------
   🔷 GET CURRENT BUDGET
   (TEMPORARY: RETURN FAKE VALUES)
--------------------------------*/
export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Fetch or create user
    let user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      user = await db.user.create({
        data: {
          clerkUserId: userId,
          email: "",
        },
      });
    }

    // 🔥🔥 TEMPORARY FAKE DATA FOR DEBUGGING — REMOVE LATER 🔥🔥
    return {
      initialBudget: {
        id: "fake-id-123",
        userId: user.id,
        amount: 5000, // Fake monthly budget
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      currentExpenses: 4900, // Fake spent amount (84%)
    };

    /* -------------------------------
       REAL CODE (DISABLED FOR NOW)
    --------------------------------
    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const whereTxn = {
      userId: user.id,
      type: "EXPENSE",
      date: { gte: startOfMonth, lte: endOfMonth },
      ...(accountId ? { accountId } : {}),
    };

    const expensesAgg = await db.transaction.aggregate({
      where: whereTxn,
      _sum: { amount: true },
    });

    const currentExpenses = toNumberSafe(expensesAgg._sum.amount);

    return {
      initialBudget: budget
        ? {
            id: budget.id,
            userId: budget.userId,
            amount: toNumberSafe(budget.amount),
            lastAlertSent: budget.lastAlertSent,
            createdAt: budget.createdAt.toISOString(),
            updatedAt: budget.updatedAt.toISOString(),
          }
        : null,
      currentExpenses,
    };
    */

  } catch (err) {
    console.error("Error fetching budget:", err);
    throw err;
  }
}

/* -------------------------------
   🔷 UPDATE BUDGET
--------------------------------*/
export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return { success: false, error: "Invalid budget amount" };
    }

    // Ensure user exists
    let user = await db.user.findUnique({ where: { clerkUserId: userId } });

    if (!user) {
      user = await db.user.create({
        data: {
          clerkUserId: userId,
          email: "",
        },
      });
    }

    // Upsert budget
    const budget = await db.budget.upsert({
      where: { userId: user.id },
      update: { amount: parsed },
      create: { userId: user.id, amount: parsed },
    });

    // Compute updated expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expensesAgg = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    const currentExpenses = toNumberSafe(expensesAgg._sum.amount);

    // Revalidate UI
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        initialBudget: {
          id: budget.id,
          userId: budget.userId,
          amount: toNumberSafe(budget.amount),
          lastAlertSent: budget.lastAlertSent,
          createdAt: budget.createdAt.toISOString(),
          updatedAt: budget.updatedAt.toISOString(),
        },
        currentExpenses,
      },
    };
  } catch (err) {
    console.error("Error updating budget:", err);
    return { success: false, error: err.message };
  }
}
