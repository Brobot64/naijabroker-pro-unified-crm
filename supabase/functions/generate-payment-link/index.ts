
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
      .select("*, clients!inner(email, name)")
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

    // Send email notification using actual client data from transaction
    const actualClientEmail = paymentTransaction.clients?.email || clientEmail;
    const actualClientName = paymentTransaction.clients?.name || clientName;
    
    if (actualClientEmail) {
      const emailSubject = "Payment Required - Insurance Premium";
      const emailMessage = `
        Dear ${actualClientName},

        Your insurance premium payment is ready for processing.

        Amount: ${currency} ${amount.toLocaleString()}
        
        Please click the link below to complete your payment:
        ${paymentUrl}

        If you have any questions, please contact us.

        Best regards,
        Your Insurance Broker
      `;

      console.log('Sending email notification to:', actualClientEmail);

      // Send email directly using Resend since we're in service context
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      
      if (resendApiKey) {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: "NaijaBroker Pro <onboarding@resend.dev>",
              to: [actualClientEmail],
              subject: emailSubject,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">${emailSubject}</h2>
                  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    ${emailMessage.replace(/\n/g, '<br>')}
                  </div>
                  <p style="color: #64748b; font-size: 14px;">
                    This is an automated message from NaijaBroker Pro Insurance Management System.
                  </p>
                </div>
              `,
            }),
          });

          if (response.ok) {
            console.log('Email sent successfully');
            
            // Log the email notification in database
            await supabaseClient
              .from("email_notifications")
              .insert({
                organization_id: paymentTransaction.organization_id,
                notification_type: "payment_link",
                recipient_email: actualClientEmail,
                subject: emailSubject,
                message: emailMessage,
                metadata: {
                  paymentTransactionId,
                  amount,
                  currency,
                },
                status: 'sent',
                sent_at: new Date().toISOString(),
              });
          } else {
            const errorData = await response.text();
            console.error('Email sending failed:', errorData);
          }
        } catch (emailError) {
          console.error('Email notification error:', emailError);
        }
      } else {
        console.log('RESEND_API_KEY not configured - email simulation mode');
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
