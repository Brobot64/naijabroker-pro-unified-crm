
import { supabase } from "@/integrations/supabase/client";

export const testDatabaseSetup = async () => {
  try {
    console.log('🧪 Testing database setup...');
    
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
};

export const getUserOrganization = async (userId: string) => {
  try {
    if (!userId?.trim()) {
      return { data: null, error: new Error('User ID is required') };
    }

    console.log('🔍 Fetching user organization for:', userId);

    // First get the profile with organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return { data: null, error: profileError };
    }

    if (!profile?.organization_id) {
      console.log('📭 No organization found for user');
      return { data: null, error: null };
    }

    console.log('🏢 Found organization ID:', profile.organization_id);

    // Then get the organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .maybeSingle();

    if (orgError) {
      console.error('❌ Error fetching organization:', orgError);
      return { data: null, error: orgError };
    }

    if (!organization) {
      console.warn('⚠️ Organization ID exists in profile but organization not found');
      return { data: null, error: new Error('Organization data inconsistency detected') };
    }

    console.log('✅ Successfully fetched organization:', organization.name);

    return { 
      data: {
        organization_id: profile.organization_id,
        organizations: organization
      }, 
      error: null 
    };
  } catch (error) {
    console.error('💥 Unexpected error fetching user organization:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
};
