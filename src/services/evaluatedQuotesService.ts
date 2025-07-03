import { supabase } from "@/integrations/supabase/client";

export interface EvaluatedQuote {
  id?: string;
  organization_id?: string;
  quote_id: string;
  insurer_id?: string;
  insurer_name: string;
  insurer_email?: string;
  premium_quoted: number;
  commission_split: number;
  terms_conditions?: string;
  exclusions?: string[];
  coverage_limits?: any;
  rating_score?: number;
  remarks?: string;
  document_url?: string;
  response_received?: boolean;
  status?: string;
  source: 'dispatched' | 'manual';
  evaluation_source?: 'human' | 'ai';
  ai_analysis?: any;
  dispatched_at?: string;
  evaluated_at?: string;
}

export const evaluatedQuotesService = {
  // Save evaluated quotes to database
  async saveEvaluatedQuotes(quoteId: string, quotes: EvaluatedQuote[]): Promise<{ data: any; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's organization
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error in saveEvaluatedQuotes:', profileError);
        throw new Error(`Profile fetch error: ${profileError.message}`);
      }

      if (!profile?.organization_id) {
        throw new Error('User organization not found');
      }

      // Delete existing evaluated quotes for this quote
      await supabase
        .from('evaluated_quotes')
        .delete()
        .eq('quote_id', quoteId)
        .eq('organization_id', profile.organization_id);

      // Insert new evaluated quotes
      const quotesToInsert = quotes.map(quote => ({
        organization_id: profile.organization_id,
        quote_id: quoteId,
        insurer_id: quote.insurer_id || null,
        insurer_name: quote.insurer_name || 'Unknown Insurer',
        insurer_email: quote.insurer_email || '',
        premium_quoted: Number(quote.premium_quoted) || 0,
        commission_split: Number(quote.commission_split) || 0,
        terms_conditions: quote.terms_conditions || '',
        exclusions: Array.isArray(quote.exclusions) ? quote.exclusions : [],
        coverage_limits: quote.coverage_limits || {},
        rating_score: Number(quote.rating_score) || 0,
        remarks: quote.remarks || '',
        document_url: quote.document_url || '',
        response_received: Boolean(quote.response_received),
        status: quote.status || 'pending',
        source: quote.source || 'manual',
        evaluation_source: quote.evaluation_source || 'human',
        ai_analysis: quote.ai_analysis || null,
        dispatched_at: quote.dispatched_at || new Date().toISOString(),
        evaluated_at: quote.evaluated_at || new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('evaluated_quotes')
        .insert(quotesToInsert)
        .select();

      return { data, error };
    } catch (error) {
      console.error('Error saving evaluated quotes:', error);
      return { data: null, error };
    }
  },

  // Get evaluated quotes for a quote
  async getEvaluatedQuotes(quoteId: string): Promise<{ data: EvaluatedQuote[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('evaluated_quotes')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: false });

      return { data: data as EvaluatedQuote[], error };
    } catch (error) {
      console.error('Error getting evaluated quotes:', error);
      return { data: null, error };
    }
  },

  // Generate client portal link
  async generateClientPortalLink(quoteId: string, clientId: string, evaluatedQuotes: EvaluatedQuote[]): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-client-portal-link', {
        body: {
          quoteId,
          clientId,
          evaluatedQuotes,
          expiryHours: 72,
        },
      });

      return { data, error };
    } catch (error) {
      console.error('Error generating client portal link:', error);
      return { data: null, error };
    }
  },

  // Send email notification
  async sendEmailNotification(type: string, recipientEmail: string, subject: string, message: string, metadata?: any): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          type,
          recipientEmail,
          subject,
          message,
          metadata,
        },
      });

      return { data, error };
    } catch (error) {
      console.error('Error sending email notification:', error);
      return { data: null, error };
    }
  },

  // Process payment
  async processPayment(quoteId: string, clientId: string, amount: number, paymentMethod: string, metadata?: any): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          quoteId,
          clientId,
          amount,
          paymentMethod,
          currency: 'NGN',
          metadata,
        },
      });

      return { data, error };
    } catch (error) {
      console.error('Error processing payment:', error);
      return { data: null, error };
    }
  },
};