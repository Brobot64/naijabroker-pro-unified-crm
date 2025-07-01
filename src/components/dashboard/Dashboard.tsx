
import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardTabs } from "./DashboardTabs";
import { DashboardTabContent } from "./DashboardTabContent";

interface DashboardProps {
  userRole: string;
}

export const Dashboard = ({ userRole }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Insurance Broker Dashboard"
        description="Welcome to NaijaBroker Pro - Complete Insurance Management System"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <DashboardTabContent userRole={userRole} />
      </Tabs>
    </div>
  );
};
