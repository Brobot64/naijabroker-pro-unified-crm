
import React, { Suspense } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DashboardStats } from "./DashboardStats";
import { RecentActivityCard } from "./RecentActivityCard";

// Lazy load heavy components
const PolicyManagement = React.lazy(() => import("@/components/policies/PolicyManagement"));
const QuoteManagement = React.lazy(() => import("@/components/quotes/QuoteManagement"));
const ClaimsManagement = React.lazy(() => import("@/components/claims/ClaimsManagement"));
const FinancialManagement = React.lazy(() => import("@/components/financial/FinancialManagement"));
const WorkflowManager = React.lazy(() => import("@/components/workflow/WorkflowManager"));
const SocialMediaDashboard = React.lazy(() => import("@/components/social/SocialMediaDashboard"));
const UserManagement = React.lazy(() => import("@/components/admin/UserManagement"));

const ComponentWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." className="py-12" />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export const DashboardTabContent = () => {
  return (
    <>
      <TabsContent value="overview" className="space-y-6">
        <ErrorBoundary>
          <DashboardStats />
        </ErrorBoundary>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorBoundary>
            <RecentActivityCard />
          </ErrorBoundary>
        </div>
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
