"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { endOfDay, startOfDay, subDays, format } from "date-fns";
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";

// Colors for pie categories
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

// Date ranges
const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

// Custom active shape for pie (pops out clicked slice)
const renderActiveShape = (props) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={sx} y={sy} textAnchor="middle" fill={fill} fontWeight="bold">
        {payload.name}
      </text>
    </g>
  );
};

const AccountChart = ({ transactions }) => {
  const [dateRange, setDateRange] = useState("1M");
  const [activeIndex, setActiveIndex] = useState(null);

  // Filtered data for Bar/Line/Area
  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days ? startOfDay(subDays(now, range.days)) : startOfDay(new Date(0));

    const filtered = transactions.filter((t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now));

    const grouped = filtered.reduce((acc, t) => {
      const date = format(new Date(t.date), "MMM dd");
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
      if (t.type === "INCOME") acc[date].income += t.amount;
      else acc[date].expense += t.amount;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions, dateRange]);

  // Totals
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, d) => ({ income: acc.income + d.income, expense: acc.expense + d.expense }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  // Category data for Pie
  const categoryData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days ? startOfDay(subDays(now, range.days)) : startOfDay(new Date(0));

    const filtered = transactions.filter((t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now));

    const grouped = filtered.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += t.amount;
      return acc;
    }, {});

    return Object.keys(grouped).map((key) => ({ name: key, value: grouped[key] }));
  }, [transactions, dateRange]);

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-7">
        <CardTitle className="text-base font-semibold">Transaction Overview</CardTitle>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        {/* Totals */}
        <div className="flex justify-around mb-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Total Income</p>
            <p className="text-lg font-bold text-green-500">${totals.income.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Total Expenses</p>
            <p className="text-lg font-bold text-red-500">${totals.expense.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Net</p>
            <p className={`text-lg font-bold ${totals.income - totals.expense >= 0 ? "text-green-500" : "text-red-500"}`}>
              ${(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabs for chart selection */}
        <Tabs defaultValue="bar" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="bar">Bar</TabsTrigger>
            <TabsTrigger value="line">Line</TabsTrigger>
            <TabsTrigger value="area">Area</TabsTrigger>
            <TabsTrigger value="pie">Pie</TabsTrigger>
          </TabsList>

          {/* Bar Chart */}
          <TabsContent value="bar">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [`$${v}`, undefined]} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#02c951" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ca1403" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Line Chart */}
          <TabsContent value="line">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [`$${v}`, undefined]} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#02c951" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#ca1403" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Area Chart */}
          <TabsContent value="area">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [`$${v}`, undefined]} />
                <Legend />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#02c951" fill="#02c95166" />
                <Area type="monotone" dataKey="expense" stackId="1" stroke="#ca1403" fill="#ca140366" />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Pie Chart */}
          <TabsContent value="pie">
            <div className="flex items-center justify-center gap-10">
              {/* Left Legend */}
              <div className="space-y-2">
                {categoryData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>

              {/* Pie */}
              <div className="h-[350px] w-[350px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      dataKey="value"
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      onClick={(_, i) => setActiveIndex(i === activeIndex ? null : i)}
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, name) => [`$${v}`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Right Legend */}
              <div className="space-y-2">
                {categoryData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AccountChart;
