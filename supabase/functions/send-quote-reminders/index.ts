import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteReminderRequest {
  quoteIds: string[];
  reminderType: 'idle' | 'no_insurer_match';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { quoteIds, reminderType }: QuoteReminderRequest = await req.json();

    // Get quote details with client and organization info
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select(`
        *,
        clients!quotes_client_id_fkey(*),
        organizations(*)
      `)
      .in('id', quoteIds);

    if (quotesError) throw quotesError;

    const emailPromises = quotes?.map(async (quote) => {
      let subject: string;
      let clientMessage: string;
      let brokerMessage: string;

      if (reminderType === 'idle') {
        subject = `Reminder: Quote ${quote.quote_number} Pending Your Selection`;
        clientMessage = `
          <h2>Quote Selection Reminder</h2>
          <p>Dear ${quote.client_name},</p>
          <p>We have received responses from insurers for your quote ${quote.quote_number}. Your selection is pending and the quote may expire soon.</p>
          <p><strong>Quote Details:</strong></p>
          <ul>
            <li>Quote Number: ${quote.quote_number}</li>
            <li>Policy Type: ${quote.policy_type}</li>
            <li>Sum Insured: ₦${Number(quote.sum_insured).toLocaleString()}</li>
            <li>Valid Until: ${new Date(quote.valid_until).toLocaleDateString()}</li>
          </ul>
          <p>Please review and select your preferred option at your earliest convenience.</p>
          <p>Best regards,<br/>${quote.organizations?.name || 'Insurance Team'}</p>
        `;
        
        brokerMessage = `
          <h2>Client Follow-up Required: Quote ${quote.quote_number}</h2>
          <p>This quote has been idle for over 3 days with insurer responses available but no client selection.</p>
          <p><strong>Action Required:</strong> Contact ${quote.client_name} for follow-up coordination.</p>
          <p><strong>Client Contact:</strong> ${quote.client_email} | ${quote.client_phone || 'N/A'}</p>
          <p><strong>Quote Details:</strong></p>
          <ul>
            <li>Quote Number: ${quote.quote_number}</li>
            <li>Valid Until: ${new Date(quote.valid_until).toLocaleDateString()}</li>
            <li>Risk of drop-off if no action taken soon</li>
          </ul>
        `;
      } else {
        subject = `Action Required: Quote ${quote.quote_number} - No Insurer Match`;
        clientMessage = `
          <h2>Quote Update: ${quote.quote_number}</h2>
          <p>Dear ${quote.client_name},</p>
          <p>We are actively working on finding the best insurance options for your quote. Our team is reviewing additional insurers to ensure you get the best coverage.</p>
          <p>We will update you shortly with available options.</p>
          <p>Best regards,<br/>${quote.organizations?.name || 'Insurance Team'}</p>
        `;
        
        brokerMessage = `
          <h2>No Insurer Match: Quote ${quote.quote_number}</h2>
          <p>This quote has not received any insurer responses after 3+ days.</p>
          <p><strong>Possible Issues:</strong></p>
          <ul>
            <li>Clause or pricing gaps</li>
            <li>Risk profile mismatch</li>
            <li>Coverage requirements too specific</li>
          </ul>
          <p><strong>Action Required:</strong> Review and potentially modify quote terms or contact additional insurers.</p>
          <p><strong>Client:</strong> ${quote.client_name} (${quote.client_email})</p>
        `;
      }

      // Send to client
      const clientEmail = resend.emails.send({
        from: `${quote.organizations?.name || 'Insurance'} <noreply@${quote.organizations?.email?.split('@')[1] || 'company.com'}>`,
        to: [quote.client_email],
        subject: subject,
        html: clientMessage,
      });

      // Send to broker (get broker admin emails)
      const { data: brokerUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('organization_id', quote.organization_id)
        .in('role', ['BrokerAdmin', 'SuperAdmin']);

      const { data: brokerProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', brokerUsers?.map(u => u.user_id) || []);

      const brokerEmails = brokerProfiles?.map(p => `${p.first_name} ${p.last_name} <${p.id}@company.com>`) || [];

      const brokerEmail = brokerEmails.length > 0 ? resend.emails.send({
        from: `System Alert <system@${quote.organizations?.email?.split('@')[1] || 'company.com'}>`,
        to: brokerEmails,
        subject: `Action Required: ${subject}`,
        html: brokerMessage,
      }) : null;

      return Promise.all([clientEmail, brokerEmail].filter(Boolean));
    }) || [];

    await Promise.all(emailPromises);

    // Log the reminder activity
    const auditLogs = quotes?.map(quote => ({
      organization_id: quote.organization_id,
      action: 'quote_reminder_sent',
      resource_type: 'quote',
      resource_id: quote.id,
      severity: 'info',
      metadata: {
        reminder_type: reminderType,
        quote_number: quote.quote_number,
        client_email: quote.client_email
      }
    }));

    if (auditLogs && auditLogs.length > 0) {
      await supabase.from('audit_logs').insert(auditLogs);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Reminders sent for ${quotes?.length || 0} quotes`,
        processed_quotes: quotes?.length || 0
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error sending quote reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);