"use client";

import React, { useState, useMemo, useEffect, } from "react";
import { BarLoader } from "react-spinners";
import { bulkDeleteTransactions } from "@/actions/account";
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
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  DollarSign,
  TrendingDown,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const ITEMS_PER_PAGE = 7;

const TransactionTable = ({ transactions }) => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleteData,
  } = useFetch(bulkDeleteTransactions);

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // 🔍 Search Filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description.toLowerCase().includes(searchLower)
      );
    }

    // 🔄 Recurring Filter
    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    // 💰 Type Filter
    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    // 🔽 Sorting
    if (sortConfig?.field) {
      result.sort((a, b) => {
        if (sortConfig.field === "date") {
          return sortConfig.direction === "asc"
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        if (sortConfig.field === "amount") {
          return sortConfig.direction === "asc"
            ? a.amount - b.amount
            : b.amount - a.amount;
        }
        if (sortConfig.field === "category") {
          return sortConfig.direction === "asc"
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        }
        return 0;
      });
    }

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  // Sorting toggle
  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  //PAGINATION 
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Select handlers
  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
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

  const handleBulkDelete = async () => {
    if (
        !window.confirm(
            `Are you sure you want to delete ${selectedIds.length} selected transaction(s)?`
    ) ) {
        return;
    }

    deleteFn(selectedIds);
}
useEffect(() => {
    if (deleteData && !deleteLoading) {
        toast.error("Transactions deleted successfully");
    }
}, [deleteData, deleteLoading]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333EA" />
        )}
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 🔍 Search Box */}
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform duration-300 group-hover:rotate-12 group-focus-within:text-green-500" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-md transition-all duration-300 hover:scale-[1.01] hover-glow-green"
            />
          </div>

          {/* 🔽 Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] rounded-2xl border border-gray-200 bg-gray-50 hover:bg-blue-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 hover:scale-[1.02] hover-glow-blue">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg bg-white">
              <SelectItem value="INCOME">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 font-medium">Income</span>
                </div>
              </SelectItem>
              <SelectItem value="EXPENSE">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-red-700 font-medium">Expense</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* 🔄 Recurring Filter */}
          <Select value={recurringFilter} onValueChange={setRecurringFilter}>
            <SelectTrigger className="w-[170px] rounded-2xl border border-gray-200 bg-gray-50 hover:bg-purple-50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 hover:scale-[1.02] hover-glow-purple">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg bg-white">
              <SelectItem value="recurring">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700 font-medium">Recurring</span>
                </div>
              </SelectItem>
              <SelectItem value="one-time">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700 font-medium">Non-Recurring</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* 🗑 Bulk Delete Button */}
          {selectedIds.length > 0 && (
            <div className="flex items-center">
              <Button
                variant="destructive"
                className="rounded-full px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Delete Selected</span>
                <span className="ml-1 font-bold">({selectedIds.length})</span>
              </Button>
            </div>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Clear Filters"
            >
              <X className="h-4 w-5" />
            </Button>
          )}
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
                      selectedIds.length === filteredAndSortedTransactions.length &&
                      filteredAndSortedTransactions.length > 0
                    }
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                  <div className="flex items-center">
                    Date
                    {sortConfig.field === "date" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                  <div className="flex items-center">
                    Category
                    {sortConfig.field === "category" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
                  <div className="flex items-center justify-end">
                    Amount
                    {sortConfig.field === "amount" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No Transactions Found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="transition-all duration-200 hover:bg-gray-100 hover:shadow-md hover:scale-[1.01] cursor-pointer"
                  >
                    <TableCell>
                      <Checkbox
                        onCheckedChange={() => handleSelect(transaction.id)}
                        checked={selectedIds.includes(transaction.id)}
                      />
                    </TableCell>
                    <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="capitalize">
                      <span
                        style={{ background: categoryColors[transaction.category] }}
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
                      {transaction.type === "EXPENSE" ? "-" : "+"}${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {transaction.isRecurring ? (
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
                                {format(new Date(transaction.nextRecurringDate), "PP")}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
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
                            onClick={() => router.push(`/transaction/edit/${transaction.id}`)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"
                          onClick={() => deleteFn([transaction.id])}>
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
        {/**PAGINATION CONTROLS*/}
        <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
            </span>
            <div className="space-x-2">
                <Button 
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                >
                    Previous
                </Button>
                <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TransactionTable;
