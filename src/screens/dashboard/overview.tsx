"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, TrendingUp, Activity } from "lucide-react"

export function DashboardOverview() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+20.1% from last month",
      icon: DollarSign,
    },
    {
      title: "Active Clients",
      value: "2,350",
      change: "+180 this month",
      icon: Users,
    },
    {
      title: "Pending Payments",
      value: "$12,234",
      change: "15 payments pending",
      icon: Activity,
    },
    {
      title: "Follow-ups",
      value: "24",
      change: "8 high priority",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your business performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Payment received from Client #{item}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      2 hours ago
                    </p>
                  </div>
                  <div className="ml-auto font-medium">+$1,999.00</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
              <p className="font-medium">Add New Client</p>
              <p className="text-sm text-muted-foreground">Create a new client profile</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
              <p className="font-medium">Record Payment</p>
              <p className="text-sm text-muted-foreground">Log a new payment</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
              <p className="font-medium">Schedule Follow-up</p>
              <p className="text-sm text-muted-foreground">Create a follow-up task</p>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
