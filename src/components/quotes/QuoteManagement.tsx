
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteManagementWorkflow } from "./QuoteManagementWorkflow";
import { QuoteList } from "./QuoteList";
import { QuoteAnalytics } from "./QuoteAnalytics";
import { Plus, BarChart3, List, Workflow } from "lucide-react";

export const QuoteManagement = () => {
  const [activeTab, setActiveTab] = useState("workflow");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quote Management</h1>
        <Button onClick={() => setActiveTab("workflow")}>
          <Plus className="h-4 w-4 mr-2" />
          New Quote Workflow
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Total Quotes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Converted to Policy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦125M</div>
            <p className="text-xs text-muted-foreground">Total Premium Value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            New Quote Workflow
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Quote Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow">
          <QuoteManagementWorkflow />
        </TabsContent>

        <TabsContent value="list">
          <QuoteList />
        </TabsContent>

        <TabsContent value="analytics">
          <QuoteAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
