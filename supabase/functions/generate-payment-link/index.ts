import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentLinkRequest {
  paymentTransactionId: string;
  clientEmail: string;
  clientName: string;
  amount: number;
  currency?: string;
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

    const { paymentTransactionId, clientEmail, clientName, amount, currency = "NGN" }: PaymentLinkRequest = await req.json();

    // Verify the payment transaction belongs to the user's organization
    const { data: paymentTransaction } = await supabaseClient
      .from("payment_transactions")
      .select("*")
      .eq("id", paymentTransactionId)
      .eq("organization_id", profile.organization_id)
      .single();

    if (!paymentTransaction) {
      throw new Error("Payment transaction not found or access denied");
    }

    // Generate payment link (in this case, redirect to client portal or payment gateway)
    const baseUrl = req.headers.get("origin") || "http://localhost:5173";
    const paymentUrl = `${baseUrl}/payment?transaction=${paymentTransactionId}`;

    // Send email notification to client with payment link
    if (clientEmail) {
      const emailSubject = "Payment Required - Insurance Premium";
      const emailMessage = `
        Dear ${clientName},

        Your insurance premium payment is ready for processing.

        Amount: ${currency} ${amount.toLocaleString()}
        
        Please click the link below to complete your payment:
        ${paymentUrl}

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
          type: "payment_link",
          recipientEmail: clientEmail,
          subject: emailSubject,
          message: emailMessage,
          metadata: {
            paymentTransactionId,
            amount,
            currency,
          },
        }),
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      paymentUrl,
      message: "Payment link generated and sent to client"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error generating payment link:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to generate payment link" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});