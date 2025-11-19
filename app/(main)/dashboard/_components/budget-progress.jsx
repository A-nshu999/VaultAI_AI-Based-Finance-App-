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

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updateBudgetData,
    error,
  } = useFetch(updateBudget);

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
    if (updateBudgetData?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully 🎉");
      
      // Small delay to ensure server-side revalidation completes
      setTimeout(() => {
        router.refresh();
      }, 500);
    }
  }, [updateBudgetData, router]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  // 🟩 Dynamic color for progress bar
  const progressColor =
    percentUsed >= 90
      ? "bg-gradient-to-r from-red-500 to-red-400"
      : percentUsed >= 75
      ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
      : "bg-gradient-to-r from-emerald-500 to-green-400";

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-2xl bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex-1 space-y-1">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Monthly Budget{" "}
            <span className="text-gray-500 font-normal">(Default Account)</span>
          </CardTitle>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32 border-gray-300 focus-visible:ring-emerald-400"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                  className="hover:bg-green-50"
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="hover:bg-red-50"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription className="text-sm text-gray-600 flex items-center gap-2">
                  {initialBudget ? (
                    <>
                      <span className="font-medium text-gray-800">
                        ${currentExpenses.toFixed(2)}
                      </span>
                      <span className="text-gray-400">used of</span>
                      <span className="font-medium text-gray-800">
                        ${initialBudget.amount.toFixed(2)}
                      </span>
                      <span className="text-gray-500">budget</span>
                    </>
                  ) : (
                    "No budget set"
                  )}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="ml-1 h-6 w-6 hover:bg-gray-100"
                >
                  <Pencil className="h-4 w-4 text-gray-500 hover:text-gray-800" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {initialBudget && (
        <CardContent>
          <div className="space-y-2 mt-2">
            <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ease-out ${progressColor}`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>{percentUsed.toFixed(1)}% used</span>
              <span>
                Remaining: $
                {(
                  initialBudget.amount -
                  Math.min(currentExpenses, initialBudget.amount)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default BudgetProgress;
