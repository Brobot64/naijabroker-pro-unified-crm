import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AppRole = 'SuperAdmin' | 'BrokerAdmin' | 'Agent' | 'Underwriter' | 'Compliance' | 'User';

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
  last_sign_in_at?: string;
  role?: AppRole;
  status?: 'active' | 'inactive' | 'pending';
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  organization_id: string | null;
  created_at: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: AppRole;
  status: string;
  organization_id: string;
  created_at: string;
  expires_at: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get current user's organization
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!currentProfile?.organization_id) throw new Error('No organization found');

      // Fetch profiles for the organization
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', currentProfile.organization_id);

      if (profilesError) throw profilesError;

      // Fetch user roles for the organization
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('organization_id', currentProfile.organization_id);

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const enhancedUsers = profiles?.map(profile => {
        const userRole = roles?.find(role => role.user_id === profile.id);
        
        return {
          ...profile,
          email: profile.id ? `user-${profile.id.slice(0, 8)}@company.com` : '',
          last_sign_in_at: profile.updated_at,
          role: (userRole?.role as AppRole) || 'User' as AppRole,
          status: 'active' as const
        };
      }) || [];

      setUsers(enhancedUsers);
      setUserRoles(roles || []);

      // Fetch team invitations
      const { data: teamInvites, error: invitesError } = await supabase
        .from('team_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (invitesError) throw invitesError;
      setInvitations(teamInvites || []);

    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('No organization found');

      // Check if user role exists, update or insert
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', profile.organization_id)
        .single();

      if (existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('id', existingRole.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: newRole,
            organization_id: profile.organization_id
          });

        if (error) throw error;
      }

      // Log the action
      await supabase
        .from('audit_logs')
        .insert([{
          organization_id: profile.organization_id,
          user_id: user.id,
          action: 'USER_ROLE_UPDATED',
          resource_type: 'user_role',
          resource_id: userId,
          new_values: { role: newRole },
          severity: 'medium'
        }]);

      await fetchUsers();
      
      toast({
        title: "Success",
        description: "User role updated successfully"
      });

    } catch (err: any) {
      console.error('Error updating user role:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const inviteUser = async (invitation: {
    email: string;
    firstName: string;
    lastName: string;
    role: AppRole;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('No organization found');

      const { error } = await supabase
        .from('team_invitations')
        .insert({
          email: invitation.email,
          first_name: invitation.firstName,
          last_name: invitation.lastName,
          role: invitation.role,
          organization_id: profile.organization_id,
          invited_by: user.id,
          status: 'pending'
        });

      if (error) throw error;

      // Log the action
      await supabase
        .from('audit_logs')
        .insert([{
          organization_id: profile.organization_id,
          user_id: user.id,
          action: 'USER_INVITED',
          resource_type: 'team_invitation',
          new_values: { email: invitation.email, role: invitation.role },
          severity: 'medium'
        }]);

      await fetchUsers();
      
      toast({
        title: "Success",
        description: `Invitation sent to ${invitation.email}`
      });

    } catch (err: any) {
      console.error('Error inviting user:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Update auth user to disable
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { ban_duration: '876000h' } // Effectively permanent ban
      );

      if (authError) throw authError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profile?.organization_id) {
        // Log the action
        await supabase
          .from('audit_logs')
          .insert([{
            organization_id: profile.organization_id,
            user_id: user.id,
            action: 'USER_DEACTIVATED',
            resource_type: 'user',
            resource_id: userId,
            severity: 'high'
          }]);
      }

      await fetchUsers();
      
      toast({
        title: "Success",
        description: "User deactivated successfully"
      });

    } catch (err: any) {
      console.error('Error deactivating user:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const activateUser = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Remove ban from auth user
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { ban_duration: 'none' }
      );

      if (authError) throw authError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profile?.organization_id) {
        // Log the action
        await supabase
          .from('audit_logs')
          .insert([{
            organization_id: profile.organization_id,
            user_id: user.id,
            action: 'USER_ACTIVATED',
            resource_type: 'user',
            resource_id: userId,
            severity: 'medium'
          }]);
      }

      await fetchUsers();
      
      toast({
        title: "Success",
        description: "User activated successfully"
      });

    } catch (err: any) {
      console.error('Error activating user:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      await fetchUsers();
      
      toast({
        title: "Success",
        description: "Invitation deleted successfully"
      });

    } catch (err: any) {
      console.error('Error deleting invitation:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    userRoles,
    invitations,
    loading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    inviteUser,
    deactivateUser,
    activateUser,
    deleteInvitation
  };
};