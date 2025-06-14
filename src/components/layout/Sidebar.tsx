
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  FileX, 
  FilePlus, 
  FileCheck, 
  Check, 
  Plus, 
  X 
} from "lucide-react";

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  userRole: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Calendar, roles: ["SuperAdmin", "BrokerAdmin", "Underwriter", "Agent"] },
  { id: "leads", label: "Lead Management", icon: Plus, roles: ["BrokerAdmin", "Agent"] },
  { id: "quotes", label: "Quote Management", icon: FilePlus, roles: ["SuperAdmin", "BrokerAdmin", "Underwriter", "Agent"] },
  { id: "policies", label: "Policy Management", icon: FileCheck, roles: ["SuperAdmin", "BrokerAdmin", "Underwriter"] },
  { id: "financial", label: "Financial", icon: Check, roles: ["SuperAdmin", "BrokerAdmin", "Underwriter"] },
  { id: "claims", label: "Claims", icon: FileX, roles: ["SuperAdmin", "BrokerAdmin", "Underwriter"] },
  { id: "users", label: "User Management", icon: Plus, roles: ["SuperAdmin", "BrokerAdmin"] },
  { id: "compliance", label: "Compliance", icon: Check, roles: ["SuperAdmin", "BrokerAdmin", "Compliance"] },
];

export const Sidebar = ({ activeModule, setActiveModule, userRole, collapsed, setCollapsed }: SidebarProps) => {
  const accessibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-blue-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">NaijaBroker Pro</h1>
              <p className="text-xs text-blue-200 mt-1">Insurance Management</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {collapsed ? <Plus className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <nav className="mt-6">
        {accessibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                "w-full flex items-center px-4 py-3 text-left hover:bg-blue-700 transition-colors",
                isActive && "bg-blue-700 border-r-2 border-green-400"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-200">Current Role</p>
            <p className="font-semibold text-white">{userRole}</p>
          </div>
        </div>
      )}
    </div>
  );
};
