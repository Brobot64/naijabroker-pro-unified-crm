import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  quoteId: string;
  clientId: string;
  amount: number;
  paymentMethod: 'paystack' | 'flutterwave' | 'bank_transfer';
  currency?: string;
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

    const { quoteId, clientId, amount, paymentMethod, currency = 'NGN', metadata }: PaymentRequest = await req.json();

    // Create payment transaction record
    const { data: transaction, error: dbError } = await supabaseClient
      .from("payment_transactions")
      .insert({
        organization_id: profile.organization_id,
        quote_id: quoteId,
        client_id: clientId,
        amount,
        currency,
        payment_method: paymentMethod,
        payment_provider: paymentMethod,
        status: 'pending',
        metadata: metadata || {},
      })
      .select()
      .single();

    if (dbError) throw dbError;

    let paymentUrl = null;
    let providerReference = null;

    // Process payment based on method
    switch (paymentMethod) {
      case 'paystack':
        // Initialize Paystack payment
        const paystackResponse = await initializePaystackPayment({
          amount: amount * 100, // Paystack expects amount in kobo
          email: metadata?.clientEmail || 'client@example.com',
          reference: transaction.id,
          callback_url: `${req.headers.get("origin")}/payment-callback`,
        });
        
        if (paystackResponse.status) {
          paymentUrl = paystackResponse.data.authorization_url;
          providerReference = paystackResponse.data.reference;
        }
        break;

      case 'flutterwave':
        // Initialize Flutterwave payment
        const flutterwaveResponse = await initializeFlutterwavePayment({
          amount,
          currency,
          tx_ref: transaction.id,
          customer: {
            email: metadata?.clientEmail || 'client@example.com',
            name: metadata?.clientName || 'Client',
          },
          redirect_url: `${req.headers.get("origin")}/payment-callback`,
        });
        
        if (flutterwaveResponse.status === 'success') {
          paymentUrl = flutterwaveResponse.data.link;
          providerReference = flutterwaveResponse.data.tx_ref;
        }
        break;

      case 'bank_transfer':
        // For bank transfer, we'll provide bank details
        const bankDetails = {
          accountName: "Your Broker Company Limited",
          accountNumber: "1234567890",
          bankName: "First Bank Nigeria",
          reference: transaction.id,
        };
        
        return new Response(JSON.stringify({
          success: true,
          paymentMethod: 'bank_transfer',
          bankDetails,
          transactionId: transaction.id,
          message: "Please transfer the amount to the provided bank details and contact us with the transaction reference.",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

    // Update transaction with provider reference
    if (providerReference) {
      await supabaseClient
        .from("payment_transactions")
        .update({ provider_reference: providerReference })
        .eq("id", transaction.id);
    }

    return new Response(JSON.stringify({
      success: true,
      paymentUrl,
      transactionId: transaction.id,
      providerReference,
      paymentMethod,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing payment:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to process payment" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Paystack payment initialization
async function initializePaystackPayment(data: any) {
  const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!paystackKey) {
    throw new Error("Paystack secret key not configured");
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${paystackKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await response.json();
}

// Flutterwave payment initialization
async function initializeFlutterwavePayment(data: any) {
  const flutterwaveKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
  if (!flutterwaveKey) {
    throw new Error("Flutterwave secret key not configured");
  }

  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${flutterwaveKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await response.json();
}