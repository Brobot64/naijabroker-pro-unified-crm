
import { supabase } from "@/integrations/supabase/client";
import { OnboardingData, CreateOrganizationResult } from './types';
import { validateOrganizationData, validateTeamData } from './validation';
import { testDatabaseSetup } from './database';

export const createOrganizationFromOnboarding = async (
  data: OnboardingData, 
  userId: string
): Promise<CreateOrganizationResult> => {
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
    const testResult = await testDatabaseSetup();
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
      throw new Error(`Failed to create organization: ${orgError.message}`);
    }

    if (!organization?.id) {
      console.error('❌ Organization created but no ID returned');
      throw new Error('Organization created but no ID returned');
    }

    console.log('✅ Organization created successfully:', organization.id);

    // Update user profile with organization
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
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    console.log('✅ Profile updated successfully for user:', userId);

    // Assign admin role
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
      throw new Error(`Failed to assign role: ${roleError.message}`);
    }

    console.log('✅ Admin role assigned successfully:', data.adminUser.role);

    // Create team invitations if any
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
};
