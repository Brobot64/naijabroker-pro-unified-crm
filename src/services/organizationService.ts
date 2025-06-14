
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
      // Create organization
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

      if (orgError) throw orgError;

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

      if (profileError) throw profileError;

      // Assign admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: data.adminUser.role as any,
          organization_id: organization.id,
        });

      if (roleError) throw roleError;

      // Create team invitations
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

        if (inviteError) throw inviteError;
      }

      return { organization, error: null };
    } catch (error) {
      console.error('Error creating organization:', error);
      return { organization: null, error };
    }
  },

  async getUserOrganization(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        organization_id,
        organizations (*)
      `)
      .eq('id', userId)
      .single();

    return { data, error };
  }
};
