
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthNavigation } from "@/hooks/useAuthNavigation";

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

  // Get navigation state from centralized hook
  const { shouldRedirectToAuth, isNavigating } = useAuthNavigation({ 
    user, 
    organizationId, 
    loading 
  });

  // Show loading spinner while authentication is being determined
  if (loading || isNavigating) {
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
  if (shouldRedirectToAuth) {
    console.log('ProtectedRoute: No user, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // For onboarding route - allow access regardless of organization status
  // The centralized navigation will handle redirects appropriately
  if (location.pathname === '/onboarding') {
    console.log('ProtectedRoute: Allowing access to onboarding');
    return <>{children}</>;
  }

  // Check role requirements for protected pages
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
