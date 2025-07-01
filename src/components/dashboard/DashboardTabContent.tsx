import React, { Suspense } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DashboardStats } from "./DashboardStats";
import { RecentActivityCard } from "./RecentActivityCard";
import { InsightsCards } from "./InsightsCards";
import { TopClientsTable } from "./TopClientsTable";
import { CriticalAlertsTable } from "./CriticalAlertsTable";
import { ChartsSection } from "./ChartsSection";
import { QuickActions } from "./QuickActions";
import { ComplianceAlerts } from "./ComplianceAlerts";

// Lazy load components for better performance
const PolicyManagement = React.lazy(() => import("@/components/policies/PolicyManagement").then(module => ({ default: module.PolicyManagement })));
const QuoteManagement = React.lazy(() => import("@/components/quotes/QuoteManagement").then(module => ({ default: module.QuoteManagement })));
const ClaimsManagement = React.lazy(() => import("@/components/claims/ClaimsManagement").then(module => ({ default: module.ClaimsManagement })));
const FinancialManagement = React.lazy(() => import("@/components/financial/FinancialManagement").then(module => ({ default: module.FinancialManagement })));
const WorkflowManager = React.lazy(() => import("@/components/workflow/WorkflowManager").then(module => ({ default: module.WorkflowManager })));
const SocialMediaDashboard = React.lazy(() => import("@/components/social/SocialMediaDashboard").then(module => ({ default: module.SocialMediaDashboard })));
const UserManagement = React.lazy(() => import("@/components/admin/UserManagement").then(module => ({ default: module.UserManagement })));

const ComponentWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." className="py-12" />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

interface DashboardTabContentProps {
  userRole: string;
}

export const DashboardTabContent = ({ userRole }: DashboardTabContentProps) => {
  return (
    <>
      <TabsContent value="overview" className="space-y-6">
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
      </TabsContent>

      <TabsContent value="policies">
        <ComponentWrapper>
          <PolicyManagement />
        </ComponentWrapper>
      </TabsContent>

      <TabsContent value="quotes">
        <ComponentWrapper>
          <QuoteManagement />
        </ComponentWrapper>
      </TabsContent>

      <TabsContent value="claims">
        <ComponentWrapper>
          <ClaimsManagement />
        </ComponentWrapper>
      </TabsContent>

      <TabsContent value="financial">
        <ComponentWrapper>
          <FinancialManagement />
        </ComponentWrapper>
      </TabsContent>

      <TabsContent value="workflows">
        <ComponentWrapper>
          <WorkflowManager />
        </ComponentWrapper>
      </TabsContent>

      <TabsContent value="social">
        <ComponentWrapper>
          <SocialMediaDashboard />
        </ComponentWrapper>
      </TabsContent>

      <TabsContent value="admin">
        <ComponentWrapper>
          <UserManagement />
        </ComponentWrapper>
      </TabsContent>

      <TabsContent value="reports">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports Dashboard</h3>
          <p className="text-gray-600">Advanced reporting features coming soon...</p>
        </div>
      </TabsContent>
    </>
  );
};
