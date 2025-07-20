import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PortalLinkRequest {
  quoteId: string;
  clientId: string;
  evaluatedQuotes: any[];
  expiryHours?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user's organization
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error("User organization not found");
    }

    const { quoteId, clientId, evaluatedQuotes, expiryHours = 72 }: PortalLinkRequest = await req.json();

    // Generate secure token
    const token_value = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    // Store portal link in database
    const { data: portalLink, error: dbError } = await supabaseClient
      .from("client_portal_links")
      .insert({
        organization_id: profile.organization_id,
        quote_id: quoteId,
        client_id: clientId,
        token: token_value,
        expires_at: expiresAt.toISOString(),
        evaluated_quotes_data: evaluatedQuotes,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Get client details for email
    const { data: client } = await supabaseClient
      .from("clients")
      .select("name, email, client_code")
      .eq("id", clientId)
      .maybeSingle();

    // Generate portal URL
    const baseUrl = req.headers.get("origin") || "http://localhost:5173";
    const portalUrl = `${baseUrl}/client-portal?token=${token_value}`;

    // Send email notification to client
    if (client?.email) {
      const emailSubject = "Quote Selection - Review Your Insurance Options";
      const clientCode = client.client_code || "Contact support for your Customer ID";
      const emailMessage = `
        Dear ${client.name},

        Your insurance quotes are ready for review. Please click the link below to view and select your preferred option:

        ${portalUrl}

        IMPORTANT: Your Customer ID is ${clientCode}
        Please keep this ID for reference when making payments.

        This link will expire in ${expiryHours} hours.

        If you have any questions, please contact us.

        Best regards,
        Your Insurance Broker
      `;

      // Call email notification function
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email-notification`, {
        method: "POST",
        headers: {
          "Authorization": req.headers.get("Authorization")!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "client_portal_link",
          recipientEmail: client.email,
          subject: emailSubject,
          message: emailMessage,
          metadata: {
            portalLinkId: portalLink.id,
            quoteId,
            clientId,
            clientCode: client.client_code,
          },
        }),
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      portalUrl,
      portalLinkId: portalLink.id,
      expiresAt: portalLink.expires_at,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error generating client portal link:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to generate client portal link" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});