
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthMethods } from './auth/authMethods';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  organizationId: string | null;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  organizationId: null,
  userRole: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const { signIn, signUp, signOut: authSignOut } = useAuthMethods();

  const fetchUserData = async (userId: string) => {
    try {
      console.log('Fetching user data for:', userId);
      
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return;
      }

      if (profile?.organization_id) {
        console.log('Setting organization ID:', profile.organization_id);
        setOrganizationId(profile.organization_id);
        
        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('organization_id', profile.organization_id)
          .maybeSingle();

        if (roleError) {
          console.error('Role fetch error:', roleError);
        } else if (roleData?.role) {
          console.log('Setting user role:', roleData.role);
          setUserRole(roleData.role);
        }
      } else {
        console.log('No organization found for user');
        setOrganizationId(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setOrganizationId(null);
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('Initial session:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await authSignOut();
      // State will be cleared by the auth state change listener
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    organizationId,
    userRole,
    signIn,
    signUp,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
