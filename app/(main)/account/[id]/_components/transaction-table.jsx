"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { categoryColors } from "@/data/categories";
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCw, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { DollarSign, TrendingDown,} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions }) => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setrecurringFilter] = useState("");


  const filteredAndSortedTransactions = transactions ?? [];
    const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
    current.includes(id)
    ? current.filter((item) => item != id)
    : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
    current.length === filteredAndSortedTransactions.length
    ? []
    : filteredAndSortedTransactions.map((t) => t.id)
);
};
  return (
    <div className="space-y-4">
    {/* Filters */}
    <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
            {/* Search Icon */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            {/* Input Field */}
            <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-2xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
            />
        </div>
        <div className="flex gap-2">
            <Select value = {typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] rounded-2xl border border-gray-300 bg-gray-50 shadow-sm hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition-all">
                    <SelectValue placeholder = "All Types"/>
                </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-md bg-white dark:bg-gray-900">
                        <SelectItem value="INCOME">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600"/>
                                Income
                            </div>
                        </SelectItem>
                        <SelectItem value="EXPENSE">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-red-600"/>
                                Expense
                            </div>
                        </SelectItem>
                    </SelectContent>
            </Select>

            <Select 
            value={recurringFilter}
            onValueChange={(value) => setrecurringFilter(value)}
            >
                <SelectTrigger className="w-[170px] rounded-2xl border border-gray-300 bg-gray-50 shadow-sm hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition-all">
                    <SelectValue placeholder="All Transactions"/>
                </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-md bg-white dark:bg-gray-900">
                        <SelectItem value="recurring">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 text-purple-600"/>
                                Recurring
                            </div>
                        </SelectItem>
                        <SelectItem value="one-time">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-600"/>
                                 Non-Recurring
                            </div>
                        </SelectItem>
                    </SelectContent>
            </Select>

            {selectedIds.length > 0 && (
                <div>
                    <Button variant="destructive" className="rounded-2xl">
                        Delete Selected ( {selectedIds.length} )
                    </Button>
                </div>
            )}
        </div>
    </div>

      {/* Transactions Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                onCheckedChange={handleSelectAll}
                checked={
                    selectedIds.length ===
                    filteredAndSortedTransactions.length &&
                    filteredAndSortedTransactions.length > 0
                }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date{" "}
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                    Category
                    {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4"/>
                    ) : (
                        <ChevronDown className="ml-1 h-4 w-4"/>
                    ))}
                    </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                    Amount
                    {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                        <ChevronUp className = "ml-1 h-4 w-4"/>
                    ) : (
                        <ChevronDown className="ml-1 h-4 w-4"/>
                    ))}
                    </div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                    onCheckedChange={() => handleSelect(transaction.id)}
                    checked={selectedIds.includes(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="capitalize">
                    <span
                      style={{
                        background: categoryColors[transaction.category],
                      }}
                      className="px-2 py-1 rounded-full text-black text-sm"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-right font-medium"
                    style={{
                      color:
                        transaction.type === "EXPENSE" ? "#990f02" : "#03c73bff",
                    }}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}${" "}
                    {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="gap-1 bg-purple-100 text-purple-800 hover:bg-purple-200"
                            >
                              <RefreshCw className="h-3 w-3" />
                              {RECURRING_INTERVALS[transaction.recurringInterval]}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">Next Date:</div>
                              <div>
                                {format(
                                  new Date(transaction.nextRecurringDate),
                                  "PP"
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        One-time
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/transaction/edit/${transaction.id}`)
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
