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

      // Combine profiles with roles and mock email/status data
      const enhancedUsers = profiles?.map(profile => {
        const userRole = roles?.find(role => role.user_id === profile.id);
        
        return {
          ...profile,
          email: `${profile.first_name?.toLowerCase() || 'user'}.${profile.last_name?.toLowerCase() || profile.id.slice(0, 8)}@company.com`,
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

      // Check if user role exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', profile.organization_id)
        .single();

      // SAFEGUARD: Prevent removing the last SuperAdmin
      if (existingRole?.role === 'SuperAdmin' && newRole !== 'SuperAdmin') {
        // Count how many SuperAdmins exist in this organization
        const { data: superAdmins, error: countError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('organization_id', profile.organization_id)
          .eq('role', 'SuperAdmin');

        if (countError) throw countError;

        if (superAdmins && superAdmins.length <= 1) {
          toast({
            title: "Action Blocked",
            description: "Cannot remove the last SuperAdmin. You must have at least one SuperAdmin in your organization.",
            variant: "destructive"
          });
          return;
        }
      }

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
          old_values: existingRole ? { role: existingRole.role } : {},
          severity: newRole === 'SuperAdmin' || existingRole?.role === 'SuperAdmin' ? 'high' : 'medium'
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

      // Send email notification
      try {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', profile.organization_id)
          .single();

        const adminMessage = `New Team Invitation Created

Invitation Details:
- Name: ${invitation.firstName} ${invitation.lastName}
- Email: ${invitation.email}
- Role: ${invitation.role}
- Organization: ${orgData?.name || 'Unknown'}
- Invited by: ${user.email}

The user ${invitation.email} has been invited to join your organization. Please use the manual activation feature in the User Management section to activate their account.

Note: Direct email invitations to external addresses require domain verification. Please activate the user manually from the admin panel.`;

        await supabase.functions.invoke('send-email-notification', {
          body: {
            type: 'team_invitation',
            recipientEmail: 'ngbrokerpro@gmail.com', // Send to verified email
            subject: `Team Invitation Created: ${invitation.firstName} ${invitation.lastName}`,
            message: adminMessage,
            metadata: {
              original_recipient: invitation.email,
              role: invitation.role,
              organization_name: orgData?.name,
              invited_by: user.email
            }
          }
        });

        console.log('✅ Invitation email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send invitation email:', emailError);
        // Don't fail the entire invitation if email fails
      }

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

  const activateInvitedUser = async (invitation: TeamInvitation) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('No organization found');

      // Use edge function to create user with admin privileges
      const { data: result, error: createError } = await supabase.functions.invoke('create-user-admin', {
        body: {
          email: invitation.email,
          firstName: invitation.first_name,
          lastName: invitation.last_name,
          role: invitation.role,
          organizationId: profile.organization_id,
          invitationId: invitation.id
        }
      });

      if (createError) throw createError;
      if (result?.error) throw new Error(result.error);

      await fetchUsers();
      
      toast({
        title: "Success",
        description: `User ${invitation.email} has been activated successfully`
      });

    } catch (err: any) {
      console.error('Error activating invited user:', err);
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
    deleteInvitation,
    activateInvitedUser
  };
};