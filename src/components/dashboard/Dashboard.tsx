
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsOverview } from "./StatsOverview";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";
import { ComplianceAlerts } from "./ComplianceAlerts";
import { InsightsCards } from "./InsightsCards";
import { DashboardStats } from "./DashboardStats";
import { ChartsSection } from "./ChartsSection";
import { RecentActivityCard } from "./RecentActivityCard";
import { TopClientsTable } from "./TopClientsTable";
import { CriticalAlertsTable } from "./CriticalAlertsTable";

interface DashboardProps {
  userRole: string;
}

export const Dashboard = ({ userRole }: DashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your brokerage.</p>
      </div>

      {/* Insurance Insights Cards */}
      <InsightsCards />

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Stats Overview */}
      <StatsOverview userRole={userRole} />

      {/* Charts Section */}
      <ChartsSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivityCard />
        </div>
        
        {/* Top Clients */}
        <div className="lg:col-span-1">
          <TopClientsTable />
        </div>
      </div>

      {/* Critical Alerts */}
      <CriticalAlertsTable />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-6">
          <QuickActions userRole={userRole} />
          <ComplianceAlerts />
        </div>
      </div>
    </div>
  );
};
