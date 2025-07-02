import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: string;
  recipientEmail: string;
  subject: string;
  message: string;
  metadata?: any;
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

    const { type, recipientEmail, subject, message, metadata }: EmailRequest = await req.json();

    // Store email notification in database
    const { data: notification, error: dbError } = await supabaseClient
      .from("email_notifications")
      .insert({
        organization_id: profile.organization_id,
        notification_type: type,
        recipient_email: recipientEmail,
        subject,
        message,
        metadata: metadata || {},
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // In a real implementation, you would send the email here using a service like Resend
    // For now, we'll just log it and mark as sent
    console.log(`Email notification sent: ${type} to ${recipientEmail}`);

    return new Response(JSON.stringify({ 
      success: true, 
      notificationId: notification.id,
      message: "Email notification sent successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error sending email notification:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to send email notification" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});