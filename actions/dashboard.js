"use server";

import { db} from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = {...obj};

    if (obj.balance) {
        serialized.balance = obj.balance.toNumber();
    }

    if (obj.amount) {
        serialized.amount = obj.amount.toNumber();
    }
    return serialized;
};

export async function createAccount(data) {
    try {
        const { userId } = await auth();
        if(!userId) throw new Error("User not authenticated");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // WE WILL CONVERT THE VALUE OF BALANCE INTO FLOAT DATA TYPE BEFORE SAVING IT

        const balanceFloat = parseFloat(data.balance)
        if(isNaN(balanceFloat)) {
            throw new Error("Invalid balance value");
        }

        // CHECK WHAETHER THE ACCOUNT CREATED BY USER IS THEIR FIRST ACCOUNT
        const existingAccounts = await db.account.findMany({
            where: { userId: user.id },
        });

        // IF USER'S FIRST ACCOUNT THEN SET IT AS DEFAULT ACCOUNT
        const shouldBeDefault = 
          existingAccounts.length === 0 ? true : data.isDeafault;

        // IF THIS ACCOUNT IS DEFAULT THEN UNSET OTHER ACCOUNTS AS FROM DEFAULT  
        if (shouldBeDefault) {
            await db.account.updateMany({
                where: {userId: userId, isDefault: true},
                data: { isDefault: false },
            });
        }

        // CREATE THE ACCOUNT
        const account = await db.account.create({
            data: {
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault,
            },
        });

        // CONVERT THE FLOAT VALUE 
        const serializedAccount = serializeTransaction(account);

        revalidatePath("/dashboard");
        return { success: true, data: serializedAccount };
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function getUserAccounts() {
    const { userId } = await auth();
    if(!userId) throw  new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });
    if(!user) {
        throw new Error("User not found"); 
    }

    const accounts = await db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    transactions: true,
                },
            },
        },
    });

    const serializedAccount = accounts.map(serializeTransaction);

    return serializedAccount;
}