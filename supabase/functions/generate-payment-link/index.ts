
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

    const { paymentTransactionId, clientEmail, clientName, amount, currency = "NGN" }: PaymentLinkRequest = await req.json();

    console.log('Generating payment link for transaction:', paymentTransactionId);

    // Verify the payment transaction exists and get its details
    const { data: paymentTransaction, error: transactionError } = await supabaseClient
      .from("payment_transactions")
      .select("*")
      .eq("id", paymentTransactionId)
      .single();

    if (transactionError) {
      console.error('Transaction fetch error:', transactionError);
      throw new Error(`Payment transaction not found: ${transactionError.message}`);
    }

    if (!paymentTransaction) {
      throw new Error("Payment transaction not found");
    }

    console.log('Found payment transaction:', paymentTransaction);

    // Generate payment link (in this case, redirect to client payment page)
    const baseUrl = req.headers.get("origin") || "https://d1379a23-d174-4759-a616-1734b9963a0a.lovableproject.com";
    const paymentUrl = `${baseUrl}/payment?transaction=${paymentTransactionId}`;

    console.log('Generated payment URL:', paymentUrl);

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

      console.log('Sending email notification to:', clientEmail);

      // Call email notification function using Supabase client
      const { error: emailError } = await supabaseClient.functions.invoke('send-email-notification', {
        body: {
          type: "payment_link",
          recipientEmail: clientEmail,
          subject: emailSubject,
          message: emailMessage,
          metadata: {
            paymentTransactionId,
            amount,
            currency,
          },
        }
      });

      if (emailError) {
        console.error("Email notification error:", emailError);
        // Don't throw error for email failure, just log it
      } else {
        console.log('Email sent successfully');
      }
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
