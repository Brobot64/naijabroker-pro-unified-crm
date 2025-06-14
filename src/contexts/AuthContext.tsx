
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userRole: string | null;
  organizationId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const { toast } = useToast();

  // Memoized function to fetch user data with proper error handling
  const fetchUserData = useCallback(async (userId: string) => {
    if (!userId) {
      console.warn('fetchUserData called without userId');
      return;
    }

    try {
      console.log('Fetching user data for:', userId);
      
      // Use Promise.allSettled to handle potential failures gracefully
      const [profileResult, roleResult] = await Promise.allSettled([
        supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      // Handle profile data
      if (profileResult.status === 'fulfilled' && !profileResult.value.error) {
        const profileData = profileResult.value.data;
        console.log('Profile data:', profileData);
        setOrganizationId(profileData?.organization_id || null);
      } else {
        console.error('Error fetching profile:', 
          profileResult.status === 'rejected' ? profileResult.reason : profileResult.value.error
        );
        setOrganizationId(null);
      }

      // Handle role data
      if (roleResult.status === 'fulfilled' && !roleResult.value.error) {
        const roleData = roleResult.value.data;
        console.log('Role data:', roleData);
        setUserRole(roleData?.role || null);
      } else {
        console.error('Error fetching role:', 
          roleResult.status === 'rejected' ? roleResult.reason : roleResult.value.error
        );
        setUserRole(null);
      }
    } catch (error) {
      console.error('Unexpected error fetching user data:', error);
      setOrganizationId(null);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to prevent potential recursion issues and race conditions
          timeoutId = setTimeout(() => {
            if (isMounted) {
              fetchUserData(session.user.id);
            }
          }, 100);
        } else {
          setUserRole(null);
          setOrganizationId(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (!isMounted) return;
        
        console.log('Initial session check:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata || {}
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your signup.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      setOrganizationId(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    userRole,
    organizationId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
