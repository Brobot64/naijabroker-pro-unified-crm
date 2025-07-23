import { supabase } from '@/integrations/supabase/client';

/**
 * Utility to force refresh and sync quote status across the application
 */
export class QuoteStatusSync {
  /**
   * Force refresh quote status from database and return latest state
   */
  static async getLatestQuoteStatus(quoteId: string) {
    try {
      const { data: quote, error } = await supabase
        .from('quotes')
        .select('id, quote_number, status, workflow_stage, payment_status, updated_at')
        .eq('id', quoteId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching latest quote status:', error);
        throw error;
      }

      if (!quote) {
        console.warn('⚠️ Quote not found:', quoteId);
        return null;
      }

      console.log('📊 Latest quote status:', quote);
      return quote;
    } catch (error) {
      console.error('❌ QuoteStatusSync.getLatestQuoteStatus failed:', error);
      throw error;
    }
  }

  /**
   * Force sync workflow status using database function
   */
  static async syncWorkflowStatus(quoteId: string) {
    try {
      const { data, error } = await supabase.rpc('sync_quote_workflow_status', {
        quote_id_param: quoteId
      });

      if (error) {
        console.error('❌ Workflow sync function failed:', error);
        throw error;
      }

      console.log('✅ Workflow status synced:', data);
      return data;
    } catch (error) {
      console.error('❌ QuoteStatusSync.syncWorkflowStatus failed:', error);
      throw error;
    }
  }

  /**
   * Comprehensive quote refresh - sync and fetch latest status
   */
  static async refreshQuoteStatus(quoteId: string) {
    try {
      console.log('🔄 Refreshing quote status for:', quoteId);
      
      // First sync workflow status
      await this.syncWorkflowStatus(quoteId);
      
      // Then fetch the latest status
      const latestStatus = await this.getLatestQuoteStatus(quoteId);
      
      console.log('✅ Quote status refresh completed');
      return latestStatus;
    } catch (error) {
      console.error('❌ QuoteStatusSync.refreshQuoteStatus failed:', error);
      throw error;
    }
  }
}