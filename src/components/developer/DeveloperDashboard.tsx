
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SubscriptionManager } from "./SubscriptionManager";
import { PaymentSystemConfig } from "./PaymentSystemConfig";
import { AdminControls } from "./AdminControls";
import { AuditLogs } from "./AuditLogs";
import { StandaloneBroker } from "./StandaloneBroker";
import { CampaignManager } from "./CampaignManager";
import { SalesOversight } from "./SalesOversight";
import { CustomerSupport } from "./CustomerSupport";

export const DeveloperDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for overview metrics
  const metrics = {
    totalSubscribers: 847,
    monthlyRevenue: 125600,
    activeInstances: 23,
    supportTickets: 12,
    systemHealth: "excellent"
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
          <p className="text-gray-600">Secure control center for SaaS platform management</p>
        </div>
        <Badge className="bg-green-100 text-green-800">System Status: {metrics.systemHealth}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metrics.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">Total Subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦{metrics.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metrics.activeInstances}</div>
            <p className="text-xs text-muted-foreground">Active Instances</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metrics.supportTickets}</div>
            <p className="text-xs text-muted-foreground">Open Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="standalone">Standalone</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
          <SubscriptionManager />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentSystemConfig />
        </TabsContent>

        <TabsContent value="admin">
          <AdminControls />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogs />
        </TabsContent>

        <TabsContent value="standalone">
          <StandaloneBroker />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignManager />
        </TabsContent>

        <TabsContent value="sales">
          <SalesOversight />
        </TabsContent>

        <TabsContent value="support">
          <CustomerSupport />
        </TabsContent>
      </Tabs>
    </div>
  );
};
