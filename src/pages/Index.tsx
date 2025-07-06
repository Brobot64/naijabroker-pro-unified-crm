
import { useState, Suspense } from "react";
import { Dashboard } from "../components/dashboard/Dashboard";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";

// Lazy load components
const AdminControls = React.lazy(() => import("../components/developer/AdminControls").then(module => ({ default: module.AdminControls })));
const UserManagement = React.lazy(() => import("../components/admin/UserManagement").then(module => ({ default: module.UserManagement })));
const QuoteManagement = React.lazy(() => import("../components/quotes/QuoteManagement").then(module => ({ default: module.QuoteManagement })));
const PolicyManagement = React.lazy(() => import("../components/policies/PolicyManagement").then(module => ({ default: module.PolicyManagement })));
const ClaimsManagement = React.lazy(() => import("../components/claims/ClaimsManagement").then(module => ({ default: module.ClaimsManagement })));
const FinancialManagement = React.lazy(() => import("../components/financial/FinancialManagement").then(module => ({ default: module.FinancialManagement })));
const DeveloperDashboard = React.lazy(() => import("../components/developer/DeveloperDashboard").then(module => ({ default: module.DeveloperDashboard })));
const OrganizationSettings = React.lazy(() => import("../components/admin/OrganizationSettings").then(module => ({ default: module.OrganizationSettings })));

const Index = () => {
  const { userRole } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  console.log('Index page - Rendering with userRole:', userRole);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard userRole={userRole || 'User'} />;
      case "quotes":
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." className="py-12" />}>
            <QuoteManagement />
          </Suspense>
        );
      case "policies":
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." className="py-12" />}>
            <PolicyManagement />
          </Suspense>
        );
      case "claims":
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." className="py-12" />}>
            <ClaimsManagement />
          </Suspense>
        );
      case "financial":
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." className="py-12" />}>
            <FinancialManagement />
          </Suspense>
        );
      case "user-management":
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." className="py-12" />}>
            <UserManagement />
          </Suspense>
        );
      case "admin-controls":
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." className="py-12" />}>
            <AdminControls />
          </Suspense>
        );
      case "developer":
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." className="py-12" />}>
            <DeveloperDashboard />
          </Suspense>
        );
      case "organization-settings":
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." className="py-12" />}>
            <OrganizationSettings />
          </Suspense>
        );
      case "settings":
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600">Settings features coming soon...</p>
          </div>
        );
      default:
        return <Dashboard userRole={userRole || 'User'} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        userRole={userRole || 'User'}
      />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
