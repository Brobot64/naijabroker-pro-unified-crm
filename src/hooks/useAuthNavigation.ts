import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

interface UseAuthNavigationProps {
  user: User | null;
  organizationId: string | null;
  loading: boolean;
  isLoading?: boolean;
}

export const useAuthNavigation = ({ 
  user, 
  organizationId, 
  loading, 
  isLoading = false 
}: UseAuthNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't navigate while still loading
    if (loading || isLoading) return;

    // Don't navigate if no user
    if (!user) return;

    // Check for custom redirect first
    const redirectTo = localStorage.getItem('redirect_after_signin');
    if (redirectTo) {
      localStorage.removeItem('redirect_after_signin');
      navigate(redirectTo);
      return;
    }

    // Only navigate if we're in the wrong place - prevent unnecessary redirects
    if (organizationId) {
      // User has organization - only redirect if on onboarding or auth
      if (location.pathname === '/onboarding' || location.pathname === '/auth') {
        navigate('/app');
      }
    } else {
      // User has no organization - only redirect if not on onboarding
      if (location.pathname !== '/onboarding' && location.pathname !== '/auth') {
        navigate('/onboarding');
      }
    }
  }, [user, organizationId, navigate, location.pathname, loading, isLoading]);

  // Return navigation state for components that need it
  return {
    shouldRedirectToOnboarding: user && !organizationId && location.pathname !== '/onboarding',
    shouldRedirectToApp: user && organizationId && (location.pathname === '/onboarding' || location.pathname === '/auth'),
    shouldRedirectToAuth: !user && location.pathname !== '/auth',
    isNavigating: loading || isLoading
  };
};