import { supabase } from '@/integrations/supabase/client';

interface QuoteReminderConfig {
  idleQuoteThresholdDays: number;
  noInsurerMatchThresholdDays: number;
}

export class QuoteReminderService {
  private static config: QuoteReminderConfig = {
    idleQuoteThresholdDays: 3,
    noInsurerMatchThresholdDays: 3
  };

  static async getIdleQuotes() {
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select(`
        *,
        evaluated_quotes(*)
      `)
      .in('workflow_stage', ['client-selection', 'quote-evaluation'])
      .eq('status', 'sent');

    if (error) throw error;

    const now = new Date();
    return quotes?.filter(quote => {
      // Check if quote has insurer responses but client hasn't selected
      const hasInsurerResponses = quote.evaluated_quotes && quote.evaluated_quotes.length > 0;
      const daysSinceCreated = (now.getTime() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24);
      
      return hasInsurerResponses && daysSinceCreated >= this.config.idleQuoteThresholdDays;
    }) || [];
  }

  static async getQuotesWithoutInsurerMatch() {
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select(`
        *,
        evaluated_quotes(*)
      `)
      .or('workflow_stage.eq.rfq-generation,rfq_document_url.not.is.null');

    if (error) throw error;

    const now = new Date();
    return quotes?.filter(quote => {
      const daysSinceRFQ = (now.getTime() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const hasNoInsurerMatch = !quote.evaluated_quotes || quote.evaluated_quotes.length === 0;
      
      return daysSinceRFQ >= this.config.noInsurerMatchThresholdDays && 
             hasNoInsurerMatch && 
             quote.workflow_stage === 'rfq-generation';
    }) || [];
  }

  static async sendQuoteReminders(quoteIds: string[], reminderType: 'idle' | 'no_insurer_match') {
    try {
      const { data, error } = await supabase.functions.invoke('send-quote-reminders', {
        body: {
          quoteIds,
          reminderType
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending quote reminders:', error);
      throw error;
    }
  }

  static async getQuotesNeedingReminders() {
    const [idleQuotes, noMatchQuotes] = await Promise.all([
      this.getIdleQuotes(),
      this.getQuotesWithoutInsurerMatch()
    ]);

    return {
      idleQuotes,
      noMatchQuotes
    };
  }
}