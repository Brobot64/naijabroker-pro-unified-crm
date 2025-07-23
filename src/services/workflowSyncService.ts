import { supabase } from '@/integrations/supabase/client';
import { WorkflowStatusService } from './workflowStatusService';
import { PaymentTransactionService } from './paymentTransactionService';

export class WorkflowSyncService {
  /**
   * Synchronizes workflow stage with quote status to ensure consistency
   */
  static async syncWorkflowStatus(quoteId: string): Promise<void> {
    try {
      console.log('🔄 WorkflowSyncService: Syncing workflow status for quote:', quoteId);
      
      // Use the database function to sync status
      const { data, error } = await supabase.rpc('sync_quote_workflow_status', {
        quote_id_param: quoteId
      });

      if (error) {
        console.error('❌ Database sync function failed:', error);
        throw error;
      }

      console.log('📊 Workflow sync result:', data);
      
      // Type guard and safe property access
      if (data && typeof data === 'object' && 'updated' in data) {
        const syncResult = data as { updated: boolean; old_status?: string; new_status?: string };
        if (syncResult.updated) {
          console.log(`✅ Status synced from ${syncResult.old_status} to ${syncResult.new_status}`);
        } else {
          console.log('✅ Status already synchronized');
        }
      }
    } catch (error) {
      console.error('❌ WorkflowSyncService: Failed to sync workflow status:', error);
      throw error;
    }
  }

  /**
   * Ensures payment transaction exists for quotes in payment stages
   */
  static async ensurePaymentTransaction(quoteId: string): Promise<boolean> {
    try {
      console.log('💳 WorkflowSyncService: Ensuring payment transaction for quote:', quoteId);
      
      const transaction = await PaymentTransactionService.ensurePaymentTransaction(quoteId);
      
      if (transaction) {
        console.log('✅ Payment transaction ensured:', transaction.id);
        return true;
      } else {
        console.log('⚠️ Failed to ensure payment transaction');
        return false;
      }
    } catch (error) {
      console.error('❌ WorkflowSyncService: Error ensuring payment transaction:', error);
      return false;
    }
  }

  /**
   * Performs a complete workflow sync - status and payment transaction
   */
  static async performCompleteSync(quoteId: string): Promise<void> {
    try {
      console.log('🔄 WorkflowSyncService: Performing complete workflow sync for quote:', quoteId);
      
      // Get current quote state
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('workflow_stage, status, client_id, premium, organization_id')
        .eq('id', quoteId)
        .single();

      if (quoteError || !quote) {
        console.error('❌ Quote not found for sync:', quoteError);
        throw new Error('Quote not found');
      }

      console.log('📊 Current quote state:', quote);

      // Ensure payment transaction exists for payment-related stages
      const paymentStages = ['client_approved', 'payment-processing', 'contract-generation'];
      if (paymentStages.includes(quote.workflow_stage)) {
        console.log('💳 Quote is in payment stage, ensuring payment transaction...');
        await this.ensurePaymentTransaction(quoteId);
      }

      // Sync the workflow status using database function
      await this.syncWorkflowStatus(quoteId);

      console.log('✅ Complete workflow sync completed');
    } catch (error) {
      console.error('❌ WorkflowSyncService: Failed to perform complete sync:', error);
      throw error;
    }
  }

  /**
   * Direct workflow progression with proper payment transaction handling
   */
  static async progressWorkflow(
    quoteId: string, 
    targetStage: string, 
    targetStatus?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
    paymentStatus?: string
  ): Promise<void> {
    try {
      console.log('📈 WorkflowSyncService: Progressing workflow:', {
        quoteId,
        targetStage,
        targetStatus,
        paymentStatus
      });

      // First ensure payment transaction exists if moving to payment stage
      const paymentStages = ['client_approved', 'payment-processing', 'contract-generation'];
      if (paymentStages.includes(targetStage)) {
        console.log('💳 Target stage requires payment transaction, ensuring it exists...');
        await this.ensurePaymentTransaction(quoteId);
      }

      // Update workflow stage, status, and payment status atomically
      await WorkflowStatusService.updateQuoteWorkflowStage(quoteId, {
        stage: targetStage,
        status: targetStatus,
        payment_status: paymentStatus
      });

      // Perform final sync to ensure consistency
      await this.syncWorkflowStatus(quoteId);

      console.log('✅ Workflow progression completed successfully');
    } catch (error) {
      console.error('❌ WorkflowSyncService: Failed to progress workflow:', error);
      throw error;
    }
  }
}