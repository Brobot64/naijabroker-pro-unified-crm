import { supabase } from '@/integrations/supabase/client';
import { WorkflowStatusService } from './workflowStatusService';

export class WorkflowSyncService {
  /**
   * Synchronizes workflow stage with quote status to ensure consistency
   */
  static async syncWorkflowStatus(quoteId: string): Promise<void> {
    try {
      console.log('🔄 Syncing workflow status for quote:', quoteId);
      
      // Use the database function to sync status
      const { data, error } = await supabase.rpc('sync_quote_workflow_status', {
        quote_id_param: quoteId
      });

      if (error) throw error;

      console.log('📊 Sync result:', data);
      
      // Type guard and safe property access
      if (data && typeof data === 'object' && 'updated' in data) {
        const syncResult = data as { updated: boolean; old_status?: string; new_status?: string };
        if (syncResult.updated) {
          console.log(`✅ Status updated from ${syncResult.old_status} to ${syncResult.new_status}`);
        } else {
          console.log('✅ Status already synchronized');
        }
      }
    } catch (error) {
      console.error('❌ Failed to sync workflow status:', error);
      throw error;
    }
  }

  /**
   * Ensures payment transaction exists for quotes in payment stages
   */
  static async ensurePaymentTransaction(quoteId: string, clientId?: string, amount?: number): Promise<boolean> {
    try {
      console.log('💳 Ensuring payment transaction exists for quote:', quoteId);
      
      // Check if payment transaction already exists
      const { data: existingTransaction } = await supabase
        .from('payment_transactions')
        .select('id, status')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingTransaction) {
        console.log('✅ Payment transaction already exists:', existingTransaction.id);
        return true;
      }

      // Get quote and client details if not provided
      if (!clientId || !amount) {
        const { data: quote } = await supabase
          .from('quotes')
          .select('client_id, premium, organization_id')
          .eq('id', quoteId)
          .single();

        if (!quote) {
          console.error('❌ Quote not found for payment transaction creation');
          return false;
        }

        clientId = clientId || quote.client_id;
        amount = amount || quote.premium;
      }

      if (!clientId) {
        console.error('❌ Cannot create payment transaction without client ID');
        return false;
      }

      // Get organization ID from quote
      const { data: quote } = await supabase
        .from('quotes')
        .select('organization_id')
        .eq('id', quoteId)
        .single();

      if (!quote?.organization_id) {
        console.error('❌ Cannot create payment transaction without organization ID');
        return false;
      }

      // Create payment transaction
      const { data: newTransaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          quote_id: quoteId,
          client_id: clientId,
          organization_id: quote.organization_id,
          amount: amount || 0,
          currency: 'NGN',
          payment_method: 'bank_transfer',
          status: 'pending'
        })
        .select()
        .single();

      if (transactionError) {
        console.error('❌ Failed to create payment transaction:', transactionError);
        return false;
      }

      console.log('✅ Payment transaction created:', newTransaction.id);
      return true;
    } catch (error) {
      console.error('❌ Error ensuring payment transaction:', error);
      return false;
    }
  }

  /**
   * Performs a complete workflow sync - status and payment transaction
   */
  static async performCompleteSync(quoteId: string): Promise<void> {
    try {
      console.log('🔄 Performing complete workflow sync for quote:', quoteId);
      
      // First sync the workflow status
      await this.syncWorkflowStatus(quoteId);
      
      // Get updated quote state
      const { data: quote } = await supabase
        .from('quotes')
        .select('workflow_stage, client_id, premium')
        .eq('id', quoteId)
        .single();

      if (!quote) throw new Error('Quote not found');

      // Ensure payment transaction exists for payment stages
      const paymentStages = ['client_approved', 'payment-processing', 'contract-generation'];
      if (paymentStages.includes(quote.workflow_stage)) {
        await this.ensurePaymentTransaction(quoteId, quote.client_id, quote.premium);
      }

      console.log('✅ Complete workflow sync completed');
    } catch (error) {
      console.error('❌ Failed to perform complete sync:', error);
      throw error;
    }
  }
}