
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

      // Create organization with proper error handling
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.organization.name,
          plan: data.organization.plan,
          industry: data.organization.industry,
          size: data.organization.size,
          primary_color: data.branding.primaryColor,
          secondary_color: data.branding.secondaryColor,
          address: data.branding.companyInfo.address,
          phone: data.branding.companyInfo.phone,
          email: data.branding.companyInfo.email,
          currency: data.systemConfig.currency,
          timezone: data.systemConfig.timezone,
          business_hours: data.systemConfig.businessHours,
          mfa_required: data.systemConfig.security.mfaRequired,
          password_policy: data.systemConfig.security.passwordPolicy,
        })
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation error:', orgError);
        throw orgError;
      }

      console.log('Organization created:', organization);

      // Update user profile with organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: organization.id,
          first_name: data.adminUser.firstName,
          last_name: data.adminUser.lastName,
          phone: data.adminUser.phone,
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      console.log('Profile updated for user:', userId);

      // Assign admin role with proper type casting
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: data.adminUser.role as any,
          organization_id: organization.id,
        });

      if (roleError) {
        console.error('Role assignment error:', roleError);
        throw roleError;
      }

      console.log('Role assigned:', data.adminUser.role);

      // Create team invitations if any
      if (data.team.length > 0) {
        const invitations = data.team.map(member => ({
          organization_id: organization.id,
          email: member.email,
          role: member.role as any,
          first_name: member.firstName,
          last_name: member.lastName,
          invited_by: userId,
        }));

        const { error: inviteError } = await supabase
          .from('team_invitations')
          .insert(invitations);

        if (inviteError) {
          console.error('Team invitation error:', inviteError);
          throw inviteError;
        }

        console.log('Team invitations created:', data.team.length);
      }

      return { organization, error: null };
    } catch (error) {
      console.error('Error creating organization:', error);
      return { organization: null, error };
    }
  },

  async getUserOrganization(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          organization_id,
          organizations (*)
        `)
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user organization:', error);
      }

      return { data, error };
    } catch (error) {
      console.error('Unexpected error fetching user organization:', error);
      return { data: null, error };
    }
  }
};
