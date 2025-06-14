
import { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Dashboard } from "../components/dashboard/Dashboard";
import { UserManagement } from "../components/admin/UserManagement";
import { AdminControls } from "../components/developer/AdminControls";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService } from "@/services/organizationService";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null);
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkOrganization = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await organizationService.getUserOrganization(user.id);
        
        if (error) {
          console.error('Error fetching organization:', error);
          return;
        }

        const hasOrg = !!data?.organization_id;
        setHasOrganization(hasOrg);
        
        // If user doesn't have an organization, redirect to onboarding
        if (!hasOrg) {
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('Error checking organization:', error);
      }
    };

    if (!loading && user) {
      checkOrganization();
    }
  }, [user, loading, navigate]);

  if (loading || hasOrganization === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard userRole={userRole || "User"} />;
      case "user-management":
        return <UserManagement />;
      case "admin-controls":
        return <AdminControls />;
      default:
        return <Dashboard userRole={userRole || "User"} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} userRole={userRole || "User"} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
