
import React, { Suspense } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DashboardStats } from "./DashboardStats";
import { RecentActivityCard } from "./RecentActivityCard";

// Import components directly since they're named exports, not default exports
import { PolicyManagement } from "@/components/policies/PolicyManagement";
import { QuoteManagement } from "@/components/quotes/QuoteManagement";
import { ClaimsManagement } from "@/components/claims/ClaimsManagement";
import { FinancialManagement } from "@/components/financial/FinancialManagement";
import { WorkflowManager } from "@/components/workflow/WorkflowManager";
import { SocialMediaDashboard } from "@/components/social/SocialMediaDashboard";
import { UserManagement } from "@/components/admin/UserManagement";

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
