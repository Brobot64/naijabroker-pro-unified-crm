
import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardTabContent } from "@/components/dashboard/DashboardTabContent";
import { useAuth } from "@/contexts/AuthContext";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { userRole } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <DashboardHeader 
          title="Insurance Broker Dashboard"
          description="Welcome to NaijaBroker Pro - Complete Insurance Management System"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} userRole={userRole || 'User'} />
          <DashboardTabContent userRole={userRole || 'User'} />
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
