
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataIntegrityTests } from "./DataIntegrityTests";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { IntegrationTests } from "./IntegrationTests";
import { LoadTesting } from "./LoadTesting";
import { ErrorBoundary } from "./ErrorBoundary";

export const TestingSuite = () => {
  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Comprehensive Testing Suite</h1>
          <p className="text-gray-600">
            Complete testing framework for data integrity, performance, integration, and load testing
          </p>
        </div>

        <Tabs defaultValue="integrity" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integrity">Data Integrity</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="load">Load Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="integrity" className="space-y-6">
            <DataIntegrityTests />
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <IntegrationTests />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceMonitor />
          </TabsContent>

          <TabsContent value="load" className="space-y-6">
            <LoadTesting />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};
