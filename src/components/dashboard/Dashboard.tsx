
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { RecentActivityCard } from "./RecentActivityCard";
import { InsightsCards } from "./InsightsCards";
import { TopClientsTable } from "./TopClientsTable";
import { CriticalAlertsTable } from "./CriticalAlertsTable";
import { ChartsSection } from "./ChartsSection";
import { QuickActions } from "./QuickActions";
import { ComplianceAlerts } from "./ComplianceAlerts";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface DashboardProps {
  userRole: string;
}

export const Dashboard = ({ userRole }: DashboardProps) => {
  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Insurance Broker Dashboard"
        description="Welcome to NaijaBroker Pro - Complete Insurance Management System"
      />

      <ErrorBoundary>
        <InsightsCards />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <DashboardStats />
      </ErrorBoundary>

      <ErrorBoundary>
        <ChartsSection />
      </ErrorBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ErrorBoundary>
            <RecentActivityCard />
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <QuickActions userRole={userRole} />
          </ErrorBoundary>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <TopClientsTable />
        </ErrorBoundary>
        <ErrorBoundary>
          <ComplianceAlerts />
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <CriticalAlertsTable />
      </ErrorBoundary>
    </div>
  );
};
