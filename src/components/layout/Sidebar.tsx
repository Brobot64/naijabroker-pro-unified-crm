
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  DollarSign, 
  Shield, 
  Settings,
  Building2,
  UserCog,
  Code,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: string;
}

export const Sidebar = ({ activeSection, onSectionChange, userRole }: SidebarProps) => {
  const { user } = useAuth();
  
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard", 
      icon: LayoutDashboard,
      roles: ["SuperAdmin", "BrokerAdmin", "Agent", "Underwriter", "Compliance", "User"]
    },
    {
      id: "quotes",
      label: "Quotes",
      icon: FileText,
      roles: ["SuperAdmin", "BrokerAdmin", "Agent", "Underwriter"]
    },
    {
      id: "policies", 
      label: "Policies",
      icon: Building2,
      roles: ["SuperAdmin", "BrokerAdmin", "Agent", "Underwriter"]
    },
    {
      id: "claims",
      label: "Claims", 
      icon: Zap,
      roles: ["SuperAdmin", "BrokerAdmin", "Agent", "Underwriter", "Compliance"]
    },
    {
      id: "financial",
      label: "Financial",
      icon: DollarSign,
      roles: ["SuperAdmin", "BrokerAdmin"]
    },
    {
      id: "user-management",
      label: "User Management",
      icon: UserCog,
      roles: ["SuperAdmin", "BrokerAdmin"]
    },
    {
      id: "admin-controls", 
      label: "Admin Controls",
      icon: Shield,
      roles: ["SuperAdmin", "BrokerAdmin"]
    },
    {
      id: "developer",
      label: "Developer Portal",
      icon: Code,
      roles: ["SuperAdmin"]
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      roles: ["SuperAdmin", "BrokerAdmin", "Agent", "Underwriter", "Compliance", "User"]
    }
  ];

  const visibleItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="bg-white w-64 shadow-lg border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">NaijaBroker Pro</h2>
        <p className="text-sm text-gray-600 mt-1">Insurance Management</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeSection === item.id
                      ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {user?.email}
            </p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
