
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  DollarSign, 
  Users, 
  AlertTriangle,
  LucideIcon
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";

interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
}

export const DashboardStats = () => {
  const { 
    activePolicies, 
    monthlyPremium, 
    pendingClaims, 
    loading 
  } = useDashboardData();

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const stats: StatItem[] = [
    {
      title: "Active Policies",
      value: loading ? "Loading..." : activePolicies.toLocaleString(),
      change: "+12%",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Monthly Premium",
      value: loading ? "Loading..." : formatCurrency(monthlyPremium),
      change: "+8%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Pending Claims",
      value: loading ? "Loading..." : pendingClaims.toString(),
      change: "-5%",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: "Team Members",
      value: "15",
      change: "+2",
      icon: Users,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stat.change}</span> from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
