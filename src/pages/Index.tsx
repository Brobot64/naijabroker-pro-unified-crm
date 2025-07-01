
import { Dashboard } from "../components/dashboard/Dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { user, loading, organizationId, userRole } = useAuth();

  console.log('Index page - Auth state:', { 
    user: user?.id, 
    loading, 
    organizationId, 
    userRole 
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to landing');
    return <Navigate to="/landing" replace />;
  }

  // If user is authenticated but has no organization, redirect to onboarding
  if (user && !organizationId) {
    console.log('User has no organization, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  console.log('Rendering dashboard with userRole:', userRole);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <Dashboard userRole={userRole || 'User'} />
      </div>
    </div>
  );
};

export default Index;
