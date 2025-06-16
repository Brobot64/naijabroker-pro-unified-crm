
import { useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useFetchUserData = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const fetchUserData = useCallback(async (userId: string) => {
    if (!userId) {
      console.warn('fetchUserData called without userId');
      return;
    }

    try {
      console.log('Fetching user data for:', userId);
      
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

  return {
    userRole,
    organizationId,
    fetchUserData,
    setUserRole,
    setOrganizationId
  };
};
