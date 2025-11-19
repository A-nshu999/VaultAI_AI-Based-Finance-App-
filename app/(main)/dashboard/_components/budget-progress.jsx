"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { updateBudget } from "@/actions/budget";
import { useRouter } from "next/navigation";

const BudgetProgress = ({ initialBudget, currentExpenses }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const { loading, fn: updateBudgetFn, data, error } = useFetch(updateBudget);
  const router = useRouter();

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (data?.success) {
      toast.success("Budget updated successfully 🎉");
      setIsEditing(false);
      router.refresh();
    }
  }, [data, router]);

  useEffect(() => {
    if (error) toast.error(error.message || "Failed to update budget");
  }, [error]);

  const progressColor =
    percentUsed >= 90
      ? "bg-red-500"
      : percentUsed >= 75
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <Card className="shadow-md rounded-xl p-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex-1">
          <CardTitle className="text-base font-semibold">
            Monthly Budget (Default Account)
          </CardTitle>

          <div className="flex items-center gap-2 mt-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={loading}
                />

                <Button variant="ghost" size="icon" onClick={handleUpdateBudget}>
                  <Check className="h-5 w-5 text-green-500" />
                </Button>

                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription>
                  {initialBudget ? (
                    <>
                      ${currentExpenses.toFixed(2)} used of $
                      {initialBudget.amount.toFixed(2)}
                    </>
                  ) : (
                    "No budget set"
                  )}
                </CardDescription>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {initialBudget && (
        <CardContent>
          <div className="space-y-2">
            <Progress
              value={percentUsed}
              extraStyles={progressColor}
            />

            <p className="text-xs text-right text-gray-500">
              {percentUsed.toFixed(1)}% used
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default BudgetProgress;
