
import { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Dashboard } from "../components/dashboard/Dashboard";
import { LeadManagement } from "../components/crm/LeadManagement";
import { QuoteManagement } from "../components/quotes/QuoteManagement";
import { PolicyManagement } from "../components/policies/PolicyManagement";
import { FinancialManagement } from "../components/financial/FinancialManagement";
import { ClaimsManagement } from "../components/claims/ClaimsManagement";
import { UserManagement } from "../components/admin/UserManagement";
import { ComplianceReports } from "../components/compliance/ComplianceReports";
import { DeveloperDashboard } from "../components/developer/DeveloperDashboard";

const Index = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [userRole, setUserRole] = useState("BrokerAdmin");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard userRole={userRole} />;
      case "leads":
        return <LeadManagement />;
      case "quotes":
        return <QuoteManagement />;
      case "policies":
        return <PolicyManagement />;
      case "financial":
        return <FinancialManagement />;
      case "claims":
        return <ClaimsManagement />;
      case "users":
        return <UserManagement />;
      case "compliance":
        return <ComplianceReports />;
      case "developer":
        return <DeveloperDashboard />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        userRole={userRole}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header 
          userRole={userRole}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};

export default Index;
