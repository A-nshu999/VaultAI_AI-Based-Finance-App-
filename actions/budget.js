"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/*export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 🧩 Auto-create user if missing
    let user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      user = await db.user.create({ data: { clerkUserId: userId } });
    }

    // 🧾 Get user's budget
    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    // 📅 Get current month's expenses
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: startOfMonth, lte: endOfMonth },
        accountId,
      },
      _sum: { amount: true },
    });

    // ✅ FIXED RETURN: renamed `budget` → `initialBudget`
    return {
      initialBudget: budget
        ? { ...budget, amount: budget.amount?.toNumber?.() ?? 0 }
        : null,
      currentExpenses: expenses._sum.amount
        ? expenses._sum.amount.toNumber()
        : 0,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 🧩 Auto-create user if missing
    let user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      user = await db.user.create({ data: { clerkUserId: userId } });
    }

    // 💰 Create or update budget
    const budget = await db.budget.upsert({
      where: { userId: user.id },
      update: { amount },
      create: { userId: user.id, amount },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: { ...budget, amount: budget.amount?.toNumber?.() ?? 0 },
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message };
  }
}
*/
function toNumberSafe(val) {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof val === "object" && typeof val.toNumber === "function") {
    try {
      return val.toNumber();
    } catch {
      return Number(String(val)) || 0;
    }
  }
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Fetch the current budget (for the user) and this month's expense total.
 * Returns:
 *  { initialBudget: { id, userId, amount: number, ... } | null, currentExpenses: number }
 */
export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Ensure user exists (if not, create a user record so budget can be attached)
    let user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      user = await db.user.create({ data: { clerkUserId: userId } });
    }

    // find current budget (there is at most one per user in your schema)
    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    // Compute current month's expense sum (optionally filtered by accountId)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Build where clause and include accountId only when provided
    const txnWhere = {
      userId: user.id,
      type: "EXPENSE",
      date: { gte: startOfMonth, lte: endOfMonth },
      ...(accountId ? { accountId } : {}),
    };

    const expensesAgg = await db.transaction.aggregate({
      where: txnWhere,
      _sum: { amount: true },
    });

    const currentExpenses = toNumberSafe(expensesAgg._sum?.amount);

    // Convert budget Decimal -> number and return a stable shape
    const initialBudget = budget
      ? {
          id: budget.id,
          userId: budget.userId,
          amount: toNumberSafe(budget.amount),
          createdAt: budget.createdAt?.toISOString?.() ?? null,
          updatedAt: budget.updatedAt?.toISOString?.() ?? null,
        }
      : null;

    return {
      initialBudget,
      currentExpenses,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

/**
 * Create or update the user's budget.
 * `amount` should be a number (or parseable). Returns success boolean and data object.
 */
export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Validate amount
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { success: false, error: "Invalid amount" };
    }

    // Ensure user exists
    let user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      user = await db.user.create({ data: { clerkUserId: userId } });
    }

    // Upsert budget record for this user
    const budget = await db.budget.upsert({
      where: { userId: user.id },
      update: { amount: parsed },
      create: { userId: user.id, amount: parsed },
    });

    // Also fetch current month's expenses to return fresh data
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

    const currentExpenses = toNumberSafe(expensesAgg._sum?.amount);

    // Revalidate dashboard so server components pick up the change quickly
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        initialBudget: {
          id: budget.id,
          userId: budget.userId,
          amount: toNumberSafe(budget.amount),
          createdAt: budget.createdAt?.toISOString?.() ?? null,
          updatedAt: budget.updatedAt?.toISOString?.() ?? null,
        },
        currentExpenses,
      },
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message || "Server error" };
  }
}