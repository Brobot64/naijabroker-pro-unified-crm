import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

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

    // Send actual email using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured - email simulation mode');
      // Simulate email sending for testing
      console.log(`Would send email to: ${recipientEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
    } else {
      const resend = new Resend(resendApiKey);
      
      try {
        // For testing: send all emails to the verified address until domain is verified
        // This prevents 403 errors from Resend during testing phase
        const testEmail = "NGBrokerPro@gmail.com"; // Your verified email
        const isTestingMode = true; // Set to false once you verify a domain in Resend
        
        const actualRecipient = isTestingMode ? testEmail : recipientEmail;
        const testingNote = isTestingMode ? 
          `<div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <strong>TESTING MODE:</strong> This email was originally intended for: ${recipientEmail}
          </div>` : '';

        const emailResponse = await resend.emails.send({
          from: "NaijaBroker Pro <onboarding@resend.dev>", // Using default Resend domain
          to: [actualRecipient],
          subject: isTestingMode ? `[TEST] ${subject}` : subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              ${testingNote}
              <h2 style="color: #2563eb;">${subject}</h2>
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <p style="color: #64748b; font-size: 14px;">
                This is an automated message from NaijaBroker Pro Insurance Management System.
              </p>
            </div>
          `,
        });

        console.log(`Email sent successfully to ${actualRecipient}:`, emailResponse);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        console.error('Error details:', emailError);
        throw new Error(`Email delivery failed: ${emailError.message}`);
      }
    }

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