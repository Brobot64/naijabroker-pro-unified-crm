
import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { WorkflowProvider } from './QuoteWorkflowProvider';
import { QuoteManagementWorkflow } from './QuoteManagementWorkflow';
import { WorkflowDashboard } from './WorkflowDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const EnhancedQuoteManagement = () => {
  return (
    <ErrorBoundary>
      <WorkflowProvider>
        <div className="space-y-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="workflow">New Quote Workflow</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <Suspense fallback={<LoadingSpinner size="lg" text="Loading dashboard..." />}>
                <WorkflowDashboard />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="workflow">
              <Suspense fallback={<LoadingSpinner size="lg" text="Loading workflow..." />}>
                <QuoteManagementWorkflow />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </WorkflowProvider>
    </ErrorBoundary>
  );
};
