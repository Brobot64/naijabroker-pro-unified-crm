import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  invitationId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create regular client to verify the requesting user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    // Verify the requesting user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user has admin privileges
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || !['SuperAdmin', 'BrokerAdmin'].includes(userRole.role)) {
      throw new Error('Insufficient privileges');
    }

    const { email, firstName, lastName, role, organizationId, invitationId }: CreateUserRequest = await req.json();

    console.log('Creating user account for:', email);

    // Create the user account using admin privileges
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }

    if (!newUser.user) {
      throw new Error('Failed to create user');
    }

    console.log('User created successfully:', newUser.user.id);

    // Update their profile with organization (using admin client)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        organization_id: organizationId,
        first_name: firstName,
        last_name: lastName
      })
      .eq('id', newUser.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw profileError;
    }

    // Assign role (using admin client)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: role,
        organization_id: organizationId
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      throw roleError;
    }

    // Delete the invitation (using admin client)
    const { error: deleteError } = await supabaseAdmin
      .from('team_invitations')
      .delete()
      .eq('id', invitationId);

    if (deleteError) {
      console.error('Error deleting invitation:', deleteError);
      throw deleteError;
    }

    // Log the action (using admin client)
    const { error: auditError } = await supabaseAdmin
      .from('audit_logs')
      .insert([{
        organization_id: organizationId,
        user_id: user.id,
        action: 'USER_MANUALLY_ACTIVATED',
        resource_type: 'user_activation',
        new_values: { 
          email: email, 
          role: role,
          activated_user_id: newUser.user.id
        },
        severity: 'high'
      }]);

    if (auditError) {
      console.error('Error logging audit:', auditError);
      // Don't throw here, just log the error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUser.user.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in create-user-admin function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});