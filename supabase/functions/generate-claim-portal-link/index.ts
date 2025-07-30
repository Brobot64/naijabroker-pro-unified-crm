import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { claimId, clientId, claimData, expiryHours = 72 } = await req.json()

    console.log('🔗 Generating claim portal link for:', { claimId, clientId, expiryHours })

    if (!claimId || !clientId) {
      return new Response(
        JSON.stringify({ error: 'Missing claimId or clientId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Set the auth header for subsequent requests
    supabase.auth.setSession = async () => {}
    
    // Verify the JWT and get user info
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user's organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      console.error('❌ Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: 'User organization not found' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate secure token
    const token = `claim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Calculate expiry time
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()

    // Create claim portal link
    const { data: portalLink, error: createError } = await supabase
      .from('claim_portal_links')
      .insert({
        organization_id: profile.organization_id,
        claim_id: claimId,
        client_id: clientId,
        token: token,
        expires_at: expiresAt,
        is_used: false,
        claim_data: claimData || {}
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating claim portal link:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create portal link' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate portal URL - use the correct app domain
    const portalUrl = `https://d1379a23-d174-4759-a616-1734b9963a0a.lovableproject.com/claim-portal?token=${token}`

    console.log('✅ Claim portal link created successfully:', portalLink.id)

    return new Response(
      JSON.stringify({
        portalUrl,
        portalLinkId: portalLink.id,
        expiresAt,
        token
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})