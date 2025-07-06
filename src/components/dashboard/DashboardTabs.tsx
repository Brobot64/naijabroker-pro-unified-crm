
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { canAccessModule } from "@/utils/rolePermissions";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  userRole: string;
}

export const DashboardTabs = ({ activeTab, onTabChange, userRole }: DashboardTabsProps) => {
  const tabs = [
    { id: 'overview', label: 'Overview', module: 'dashboard' },
    { id: 'policies', label: 'Policies', module: 'policies' },
    { id: 'quotes', label: 'Quotes', module: 'quotes' },
    { id: 'claims', label: 'Claims', module: 'claims' },
    { id: 'financial', label: 'Financial', module: 'financial' },
    { id: 'workflows', label: 'Workflows', module: 'dashboard' },
    { id: 'social', label: 'Social Media', module: 'dashboard' },
    { id: 'admin', label: 'Admin', module: 'users' },
    { id: 'developer', label: 'Developer', module: 'system' },
    { id: 'reports', label: 'Reports', module: 'dashboard' }
  ];

  const visibleTabs = tabs.filter(tab => canAccessModule(userRole, tab.module));
  const gridCols = `grid-cols-${visibleTabs.length}`;

  return (
    <TabsList className={`grid w-full ${gridCols}`}>
      {visibleTabs.map(tab => (
        <TabsTrigger key={tab.id} value={tab.id}>
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
