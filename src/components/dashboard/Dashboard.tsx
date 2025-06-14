
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsOverview } from "./StatsOverview";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";
import { ComplianceAlerts } from "./ComplianceAlerts";

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

      <StatsOverview userRole={userRole} />

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
