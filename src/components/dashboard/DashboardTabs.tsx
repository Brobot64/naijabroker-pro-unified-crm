
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const DashboardTabs = ({ activeTab, onTabChange }: DashboardTabsProps) => {
  return (
    <TabsList className="grid w-full grid-cols-9">
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="policies">Policies</TabsTrigger>
      <TabsTrigger value="quotes">Quotes</TabsTrigger>
      <TabsTrigger value="claims">Claims</TabsTrigger>
      <TabsTrigger value="financial">Financial</TabsTrigger>
      <TabsTrigger value="workflows">Workflows</TabsTrigger>
      <TabsTrigger value="social">Social Media</TabsTrigger>
      <TabsTrigger value="admin">Admin</TabsTrigger>
      <TabsTrigger value="reports">Reports</TabsTrigger>
    </TabsList>
  );
};
