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

    console.log('Auth navigation check:', { 
      userId: user.id, 
      organizationId, 
      pathname: location.pathname 
    });

    // Check for custom redirect first
    const redirectTo = localStorage.getItem('redirect_after_signin');
    if (redirectTo) {
      localStorage.removeItem('redirect_after_signin');
      console.log('Custom redirect found:', redirectTo);
      navigate(redirectTo);
      return;
    }

    // Add small delay to ensure organizationId is properly loaded
    const timeoutId = setTimeout(() => {
      if (organizationId) {
        // User has organization - should go to dashboard unless already there
        if (location.pathname === '/onboarding' || location.pathname === '/auth') {
          console.log('User has organization, redirecting to dashboard');
          navigate('/app');
        }
      } else {
        // User has no organization - should go to onboarding unless already there
        if (location.pathname !== '/onboarding') {
          console.log('User has no organization, redirecting to onboarding');
          navigate('/onboarding');
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user, organizationId, navigate, location.pathname, loading, isLoading]);

  // Return navigation state for components that need it
  return {
    shouldRedirectToOnboarding: user && !organizationId && location.pathname !== '/onboarding',
    shouldRedirectToApp: user && organizationId && (location.pathname === '/onboarding' || location.pathname === '/auth'),
    shouldRedirectToAuth: !user && location.pathname !== '/auth',
    isNavigating: loading || isLoading
  };
};