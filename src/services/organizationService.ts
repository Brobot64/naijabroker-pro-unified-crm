
import { supabase } from "@/integrations/supabase/client";

export interface OnboardingData {
  organization: {
    name: string;
    plan: string;
    industry: string;
    size: string;
  };
  adminUser: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
  };
  systemConfig: {
    currency: string;
    timezone: string;
    businessHours: string;
    security: {
      mfaRequired: boolean;
      passwordPolicy: string;
    };
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    companyInfo: {
      address: string;
      phone: string;
      email: string;
    };
  };
  team: Array<{
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  }>;
}

export const organizationService = {
  async createOrganizationFromOnboarding(data: OnboardingData, userId: string) {
    try {
      console.log('Creating organization for user:', userId, data);

      // Validate required data
      if (!data.organization.name || !data.organization.plan || !userId) {
        throw new Error('Missing required organization data');
      }

      // Create organization with proper error handling
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.organization.name,
          plan: data.organization.plan,
          industry: data.organization.industry || null,
          size: data.organization.size || null,
          primary_color: data.branding.primaryColor || '#2563eb',
          secondary_color: data.branding.secondaryColor || '#64748b',
          address: data.branding.companyInfo.address || null,
          phone: data.branding.companyInfo.phone || null,
          email: data.branding.companyInfo.email || null,
          currency: data.systemConfig.currency || 'NGN',
          timezone: data.systemConfig.timezone || 'Africa/Lagos',
          business_hours: data.systemConfig.businessHours || '9:00-17:00',
          mfa_required: data.systemConfig.security.mfaRequired || false,
          password_policy: data.systemConfig.security.passwordPolicy || 'standard',
        })
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation error:', orgError);
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      console.log('Organization created:', organization);

      // Update user profile with organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: organization.id,
          first_name: data.adminUser.firstName || null,
          last_name: data.adminUser.lastName || null,
          phone: data.adminUser.phone || null,
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw new Error(`Failed to update profile: ${profileError.message}`);
      }

      console.log('Profile updated for user:', userId);

      // Assign admin role with proper validation
      const adminRole = data.adminUser.role || 'BrokerAdmin';
      if (!['SuperAdmin', 'BrokerAdmin', 'Agent', 'Underwriter', 'Compliance', 'User'].includes(adminRole)) {
        throw new Error(`Invalid role: ${adminRole}`);
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: adminRole as any,
          organization_id: organization.id,
        });

      if (roleError) {
        console.error('Role assignment error:', roleError);
        throw new Error(`Failed to assign role: ${roleError.message}`);
      }

      console.log('Role assigned:', adminRole);

      // Create team invitations if any
      if (data.team && data.team.length > 0) {
        const validInvitations = data.team.filter(member => 
          member.email && member.role && 
          ['SuperAdmin', 'BrokerAdmin', 'Agent', 'Underwriter', 'Compliance', 'User'].includes(member.role)
        );

        if (validInvitations.length > 0) {
          const invitations = validInvitations.map(member => ({
            organization_id: organization.id,
            email: member.email,
            role: member.role as any,
            first_name: member.firstName || null,
            last_name: member.lastName || null,
            invited_by: userId,
          }));

          const { error: inviteError } = await supabase
            .from('team_invitations')
            .insert(invitations);

          if (inviteError) {
            console.error('Team invitation error:', inviteError);
            // Don't throw here as this is not critical to the main flow
            console.warn('Failed to create some team invitations, but organization setup completed');
          } else {
            console.log('Team invitations created:', validInvitations.length);
          }
        }
      }

      return { organization, error: null };
    } catch (error) {
      console.error('Error creating organization:', error);
      return { 
        organization: null, 
        error: error instanceof Error ? error : new Error('Unknown error occurred') 
      };
    }
  },

  async getUserOrganization(userId: string) {
    try {
      if (!userId) {
        return { data: null, error: new Error('User ID is required') };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          organization_id,
          organizations (*)
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user organization:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error fetching user organization:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error occurred') 
      };
    }
  }
};
