
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string[];
}

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, loading, userRole, organizationId } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Auth state:', { 
    user: user?.id, 
    loading, 
    userRole, 
    organizationId,
    pathname: location.pathname 
  });

  // Show loading spinner while authentication is being determined
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

  // Redirect to auth page if user is not authenticated
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is authenticated but has no organization, redirect to onboarding
  if (user && !organizationId) {
    console.log('ProtectedRoute: No organization, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // Special handling for onboarding route - only allow if user has no organization
  if (location.pathname === '/onboarding') {
    if (organizationId) {
      console.log('ProtectedRoute: User has organization, redirecting to app');
      return <Navigate to="/app" replace />;
    }
    console.log('ProtectedRoute: Allowing access to onboarding');
    return <>{children}</>;
  }

  // Check role requirements
  if (requireRole && userRole && !requireRole.includes(userRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
