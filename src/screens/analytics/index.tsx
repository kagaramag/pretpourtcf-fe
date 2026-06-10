"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Info, Calendar, Download, TrendingUp, DollarSign } from "@/icons";
import { formatCurrency } from "@/lib/utils";
import { dummyAnalyticsOverview, dummyAgentAnalytics } from "@/utils/dummyData";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function AnalyticsScreen() {
  const [dateRange, setDateRange] = useState("month");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const overview = dummyAnalyticsOverview;

  // Dummy chart data
  const revenueData = [
    { month: "Jan", revenue: 45000, payments: 120 },
    { month: "Feb", revenue: 52000, payments: 145 },
    { month: "Mar", revenue: 48000, payments: 132 },
    { month: "Apr", revenue: 61000, payments: 168 },
    { month: "May", revenue: 58000, payments: 156 },
    { month: "Jun", revenue: 67000, payments: 178 },
    { month: "Jul", revenue: 71000, payments: 195 },
    { month: "Aug", revenue: 69000, payments: 189 },
    { month: "Sep", revenue: 74000, payments: 201 },
    { month: "Oct", revenue: 78000, payments: 215 },
  ];

  const agentPerformanceData = dummyAgentAnalytics.map((agent) => ({
    name: agent.agentName.split(" ")[0],
    revenue: agent.totalRevenue,
    clients: agent.clientCount,
    score: agent.performanceScore,
  }));

  const handleExport = () => {
    alert("Export functionality will be implemented with actual API");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track performance, payments, and agent activities
          </p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card>
        <div className="p-6 flex gap-4 flex-wrap">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border rounded-md px-3 py-2 bg-gray-100"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="border rounded-md px-3 py-2 bg-gray-100"
            >
              <option value="all">All Agents</option>
              {dummyAgentAnalytics.map((agent) => (
                <option key={agent.agentId} value={agent.agentId}>
                  {agent.agentName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Status</label>
            <select className="border rounded-md px-3 py-2 bg-gray-100">
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <div className="text-2xl font-bold">
              {formatCurrency(overview.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />+
              {overview.monthlyGrowth.toFixed(1)}% from last month
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="text-2xl font-bold">{overview.activeClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {overview.totalClients} total clients
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {overview.overduePayments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(overview.overdueAmount)} outstanding
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="text-2xl font-bold">
              {overview.pendingFollowups}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.completedFollowups} completed this month
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#84994F"
                strokeWidth={2}
                name="Revenue (GHS)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#84994F" name="Revenue (GHS)" />
              <Bar dataKey="clients" fill="#1C352D" name="Clients" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Agent</th>
                  <th className="text-right py-3 px-4">Clients</th>
                  <th className="text-right py-3 px-4">Revenue</th>
                  <th className="text-right py-3 px-4">Overdue</th>
                  <th className="text-right py-3 px-4">Completed</th>
                  <th className="text-right py-3 px-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {dummyAgentAnalytics.map((agent) => (
                  <tr
                    key={agent.agentId}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="py-3 px-4 font-medium">{agent.agentName}</td>
                    <td className="text-right py-3 px-4">
                      {agent.clientCount}
                    </td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency(agent.totalRevenue)}
                    </td>
                    <td className="text-right py-3 px-4 text-red-600">
                      {agent.overduePayments}
                    </td>
                    <td className="text-right py-3 px-4 text-green-600">
                      {agent.completedFollowups}
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          agent.performanceScore >= 90
                            ? "bg-green-100 text-green-800"
                            : agent.performanceScore >= 80
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {agent.performanceScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
