
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

// Validation helper functions
const validateOrganizationData = (data: OnboardingData, userId: string): string | null => {
  if (!userId) return 'User ID is required';
  if (!data.organization.name?.trim()) return 'Organization name is required';
  if (!data.organization.plan?.trim()) return 'Organization plan is required';
  if (!data.adminUser.firstName?.trim()) return 'Admin first name is required';
  if (!data.adminUser.lastName?.trim()) return 'Admin last name is required';
  if (!data.adminUser.email?.trim()) return 'Admin email is required';
  
  const validRoles = ['SuperAdmin', 'BrokerAdmin', 'Agent', 'Underwriter', 'Compliance', 'User'];
  if (!validRoles.includes(data.adminUser.role)) {
    return `Invalid admin role: ${data.adminUser.role}. Must be one of: ${validRoles.join(', ')}`;
  }
  
  return null;
};

const validateTeamData = (team: OnboardingData['team']): string | null => {
  if (!Array.isArray(team)) return 'Team data must be an array';
  
  const validRoles = ['SuperAdmin', 'BrokerAdmin', 'Agent', 'Underwriter', 'Compliance', 'User'];
  
  for (let i = 0; i < team.length; i++) {
    const member = team[i];
    if (!member.email?.trim()) return `Team member ${i + 1}: Email is required`;
    if (!member.role?.trim()) return `Team member ${i + 1}: Role is required`;
    if (!validRoles.includes(member.role)) {
      return `Team member ${i + 1}: Invalid role ${member.role}. Must be one of: ${validRoles.join(', ')}`;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(member.email)) {
      return `Team member ${i + 1}: Invalid email format`;
    }
  }
  
  return null;
};

export const organizationService = {
  // Test function to verify database setup
  async testDatabaseSetup() {
    try {
      console.log('🧪 Testing database setup...');
      
      // Check if we can call our test function
      const { data, error } = await supabase.rpc('test_organization_insert');
      
      if (error) {
        console.error('❌ Database test failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Database test result:', data);
      return { success: true, message: data };
    } catch (error) {
      console.error('💥 Database test error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async createOrganizationFromOnboarding(data: OnboardingData, userId: string) {
    try {
      console.log('🚀 Starting organization creation for user:', userId);
      console.log('📊 Organization data:', data.organization);

      // Validate input data
      const validationError = validateOrganizationData(data, userId);
      if (validationError) {
        console.error('❌ Validation failed:', validationError);
        throw new Error(validationError);
      }

      // Validate team data if provided
      if (data.team && data.team.length > 0) {
        const teamValidationError = validateTeamData(data.team);
        if (teamValidationError) {
          console.error('❌ Team validation failed:', teamValidationError);
          throw new Error(teamValidationError);
        }
      }

      // Check current user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Authentication check failed:', authError);
        throw new Error('User is not authenticated');
      }
      
      if (user.id !== userId) {
        console.error('❌ User ID mismatch:', { expected: userId, actual: user.id });
        throw new Error('User ID mismatch');
      }

      console.log('✅ User authentication verified:', user.id);

      // Test database setup first
      const testResult = await this.testDatabaseSetup();
      if (!testResult.success) {
        console.error('❌ Database setup test failed:', testResult.error);
        throw new Error(`Database setup issue: ${testResult.error}`);
      }
      console.log('✅ Database setup verified');

      // Create organization with the fresh table structure
      const organizationPayload = {
        name: data.organization.name.trim(),
        plan: data.organization.plan.trim(),
        industry: data.organization.industry?.trim() || null,
        size: data.organization.size?.trim() || null,
        primary_color: data.branding.primaryColor || '#2563eb',
        secondary_color: data.branding.secondaryColor || '#64748b',
        address: data.branding.companyInfo.address?.trim() || null,
        phone: data.branding.companyInfo.phone?.trim() || null,
        email: data.branding.companyInfo.email?.trim() || null,
        currency: data.systemConfig.currency || 'NGN',
        timezone: data.systemConfig.timezone || 'Africa/Lagos',
        business_hours: data.systemConfig.businessHours || '9:00-17:00',
        mfa_required: data.systemConfig.security.mfaRequired || false,
        password_policy: data.systemConfig.security.passwordPolicy || 'standard',
      };

      console.log('📤 Creating organization with payload:', organizationPayload);

      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert(organizationPayload)
        .select()
        .single();

      if (orgError) {
        console.error('❌ Organization creation error:', orgError);
        console.error('❌ Error code:', orgError.code);
        console.error('❌ Error message:', orgError.message);
        console.error('❌ Error details:', orgError.details);
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      if (!organization?.id) {
        console.error('❌ Organization created but no ID returned');
        throw new Error('Organization created but no ID returned');
      }

      console.log('✅ Organization created successfully:', organization.id);

      // Update user profile with organization - use upsert for safety
      const profilePayload = {
        id: userId,
        organization_id: organization.id,
        first_name: data.adminUser.firstName.trim(),
        last_name: data.adminUser.lastName.trim(),
        phone: data.adminUser.phone?.trim() || null,
      };

      console.log('📤 Updating profile with payload:', profilePayload);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload);

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        console.error('❌ Profile error code:', profileError.code);
        console.error('❌ Profile error message:', profileError.message);
        throw new Error(`Failed to update profile: ${profileError.message}`);
      }

      console.log('✅ Profile updated successfully for user:', userId);

      // Assign admin role with validation
      const rolePayload = {
        user_id: userId,
        role: data.adminUser.role as any,
        organization_id: organization.id,
      };

      console.log('📤 Creating role with payload:', rolePayload);

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert(rolePayload);

      if (roleError) {
        console.error('❌ Role assignment error:', roleError);
        console.error('❌ Role error code:', roleError.code);
        console.error('❌ Role error message:', roleError.message);
        throw new Error(`Failed to assign role: ${roleError.message}`);
      }

      console.log('✅ Admin role assigned successfully:', data.adminUser.role);

      // Create team invitations if any - handle gracefully
      if (data.team && data.team.length > 0) {
        const validInvitations = data.team.filter(member => 
          member.email?.trim() && member.role?.trim()
        );

        if (validInvitations.length > 0) {
          const invitations = validInvitations.map(member => ({
            organization_id: organization.id,
            email: member.email.trim().toLowerCase(),
            role: member.role as any,
            first_name: member.firstName?.trim() || null,
            last_name: member.lastName?.trim() || null,
            invited_by: userId,
          }));

          console.log('📤 Creating team invitations:', invitations.length);

          const { error: inviteError } = await supabase
            .from('team_invitations')
            .insert(invitations);

          if (inviteError) {
            console.error('⚠️ Team invitation error:', inviteError);
            // Don't throw here as this is not critical to the main flow
            console.warn('Failed to create some team invitations, but organization setup completed');
          } else {
            console.log('✅ Team invitations created successfully:', validInvitations.length);
          }
        }
      }

      console.log('🎉 Organization creation completed successfully!');
      return { organization, error: null };
    } catch (error) {
      console.error('💥 Critical error in organization creation:', error);
      return { 
        organization: null, 
        error: error instanceof Error ? error : new Error('Unknown error occurred') 
      };
    }
  },

  async getUserOrganization(userId: string) {
    try {
      if (!userId?.trim()) {
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

      // Validate the returned data structure
      if (data && data.organization_id && !data.organizations) {
        console.warn('Organization ID exists but organization data is missing');
        return { 
          data: null, 
          error: new Error('Organization data inconsistency detected') 
        };
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
