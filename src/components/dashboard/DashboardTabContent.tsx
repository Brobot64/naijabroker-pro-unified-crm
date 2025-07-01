
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { DashboardStats } from "./DashboardStats";
import { RenewalReminders } from "@/components/policies/RenewalReminders";
import { RecentActivityCard } from "./RecentActivityCard";
import { PolicyManagement } from "@/components/policies/PolicyManagement";
import { QuoteManagement } from "@/components/quotes/QuoteManagement";
import { ClaimsManagement } from "@/components/claims/ClaimsManagement";
import { FinancialManagement } from "@/components/financial/FinancialManagement";
import { WorkflowManager } from "@/components/workflow/WorkflowManager";
import { SocialMediaDashboard } from "@/components/social/SocialMediaDashboard";
import { UserManagement } from "@/components/admin/UserManagement";
import { ComplianceReports } from "@/components/compliance/ComplianceReports";
import { 
  FileText, 
  DollarSign, 
  AlertTriangle,
  Activity,
  Settings,
  BarChart3
} from "lucide-react";

export const DashboardTabContent = () => {
  return (
    <>
      <TabsContent value="overview" className="space-y-6">
        <DashboardStats />
        <RenewalReminders />
        <RecentActivityCard />
      </TabsContent>

      <TabsContent value="policies">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Policy Management</h2>
            <FileText className="h-6 w-6 text-gray-600" />
          </div>
          <PolicyManagement />
        </div>
      </TabsContent>

      <TabsContent value="quotes">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Quote Management</h2>
            <DollarSign className="h-6 w-6 text-gray-600" />
          </div>
          <QuoteManagement />
        </div>
      </TabsContent>

      <TabsContent value="claims">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Claims Management</h2>
            <AlertTriangle className="h-6 w-6 text-gray-600" />
          </div>
          <ClaimsManagement />
        </div>
      </TabsContent>

      <TabsContent value="financial">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Financial Management</h2>
            <DollarSign className="h-6 w-6 text-gray-600" />
          </div>
          <FinancialManagement />
        </div>
      </TabsContent>

      <TabsContent value="workflows">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Workflow Management</h2>
            <Activity className="h-6 w-6 text-gray-600" />
          </div>
          <WorkflowManager />
        </div>
      </TabsContent>

      <TabsContent value="social">
        <SocialMediaDashboard />
      </TabsContent>

      <TabsContent value="admin">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
            <Settings className="h-6 w-6 text-gray-600" />
          </div>
          <UserManagement />
        </div>
      </TabsContent>

      <TabsContent value="reports">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Reports & Compliance</h2>
            <BarChart3 className="h-6 w-6 text-gray-600" />
          </div>
          <ComplianceReports />
        </div>
      </TabsContent>
    </>
  );
};
