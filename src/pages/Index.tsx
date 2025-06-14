
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
      if (!user) {
        console.log('No user found, skipping organization check');
        return;
      }
      
      try {
        console.log('Checking organization for user:', user.id);
        const { data, error } = await organizationService.getUserOrganization(user.id);
        
        if (error) {
          console.error('Error fetching organization:', error);
          setHasOrganization(false);
          return;
        }

        const hasOrg = !!(data?.organization_id && data?.organizations);
        console.log('Organization check result:', hasOrg, data);
        setHasOrganization(hasOrg);
        
        // If user doesn't have an organization, redirect to onboarding
        if (!hasOrg) {
          console.log('No organization found, redirecting to onboarding');
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('Error checking organization:', error);
        setHasOrganization(false);
      }
    };

    // Only check organization if we have a user and auth is not loading
    if (!loading && user) {
      checkOrganization();
    } else if (!loading && !user) {
      // If no user and not loading, they should be redirected by ProtectedRoute
      console.log('No user found and not loading');
    }
  }, [user, loading, navigate]);

  // Show loading while auth is loading or while checking organization
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

  // If user doesn't have an organization, this will be handled by the redirect above
  // But we add this as a fallback
  if (!hasOrganization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Required</h2>
          <p className="text-gray-600">Redirecting to onboarding...</p>
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
