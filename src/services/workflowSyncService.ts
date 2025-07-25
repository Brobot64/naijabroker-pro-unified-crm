import { supabase } from '@/integrations/supabase/client';
import { WorkflowStatusService } from './workflowStatusService';
import { PaymentTransactionService } from './paymentTransactionService';
import { ClientPortalLinkService } from './clientPortalLinkService';

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
   * Direct workflow progression with comprehensive requirement handling
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

      // Handle automatic requirements based on stage
      await this.handleStageRequirements(quoteId, targetStage);

      // Critical: Sync evaluated quotes data to main quotes table when completing
      if (targetStage === 'completed') {
        await this.syncEvaluatedQuotesToMain(quoteId);
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

  /**
   * Sync selected evaluated quote data back to main quotes table
   */
  private static async syncEvaluatedQuotesToMain(quoteId: string): Promise<void> {
    try {
      console.log('🔄 Syncing evaluated quotes data to main quotes table for:', quoteId);

      // Get the best/selected evaluated quote
      const { data: evaluatedQuotes, error: evalError } = await supabase
        .from('evaluated_quotes')
        .select('*')
        .eq('quote_id', quoteId)
        .eq('response_received', true)
        .order('rating_score', { ascending: false })
        .limit(1);

      if (evalError) {
        console.error('❌ Failed to fetch evaluated quotes:', evalError);
        return;
      }

      if (!evaluatedQuotes || evaluatedQuotes.length === 0) {
        console.log('⚠️ No evaluated quotes found to sync');
        return;
      }

      const selectedQuote = evaluatedQuotes[0];
      console.log('📊 Syncing data from selected evaluated quote:', {
        insurer: selectedQuote.insurer_name,
        premium: selectedQuote.premium_quoted,
        rating: selectedQuote.rating_score
      });

      // Update the main quotes table with the selected quote data
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          premium: selectedQuote.premium_quoted,
          underwriter: selectedQuote.insurer_name,
          commission_rate: selectedQuote.commission_split,
          terms_conditions: selectedQuote.terms_conditions || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (updateError) {
        console.error('❌ Failed to update main quotes table:', updateError);
        throw updateError;
      }

      console.log('✅ Successfully synced evaluated quote data to main quotes table');
    } catch (error) {
      console.error('❌ Error syncing evaluated quotes to main table:', error);
      throw error;
    }
  }

  /**
   * Handle automatic requirements for each workflow stage
   */
  private static async handleStageRequirements(quoteId: string, targetStage: string): Promise<void> {
    console.log('🔧 Handling stage requirements for:', targetStage);

    // Client portal link required stages
    const portalLinkStages = ['client-selection', 'client_approved', 'payment-processing'];
    if (portalLinkStages.includes(targetStage)) {
      console.log('🔗 Ensuring client portal link exists...');
      await ClientPortalLinkService.ensureClientPortalLink(quoteId);
    }

    // Payment transaction required stages
    const paymentStages = ['client_approved', 'payment-processing', 'contract-generation'];
    if (paymentStages.includes(targetStage)) {
      console.log('💳 Ensuring payment transaction exists...');
      await this.ensurePaymentTransaction(quoteId);
    }
  }

  /**
   * Auto-transition workflow based on current stage
   */
  static async autoTransitionWorkflow(quoteId: string): Promise<string | null> {
    try {
      console.log('🤖 Auto-transitioning workflow for quote:', quoteId);

      // Get current quote state
      const { data: quote, error } = await supabase
        .from('quotes')
        .select('id, workflow_stage, status, payment_status')
        .eq('id', quoteId)
        .maybeSingle();

      if (error || !quote) {
        console.error('❌ Failed to fetch quote for auto-transition:', error);
        return null;
      }

      const currentStage = quote.workflow_stage;
      
      // Define auto-transition rules
      const autoTransitions: Record<string, { nextStage: string; condition?: () => boolean }> = {
        'quote-evaluation': {
          nextStage: 'client-selection',
          condition: () => {
            // Auto-transition if we have evaluated quotes
            return true; // Can add more sophisticated checks here
          }
        }
      };

      const transition = autoTransitions[currentStage];
      if (transition && (!transition.condition || transition.condition())) {
        console.log(`🎯 Auto-transitioning from ${currentStage} to ${transition.nextStage}`);
        
        await this.progressWorkflow(
          quoteId,
          transition.nextStage,
          'sent'
        );
        
        return transition.nextStage;
      }

      console.log('⏸️ No auto-transition available for stage:', currentStage);
      return null;
    } catch (error) {
      console.error('❌ Auto-transition failed:', error);
      return null;
    }
  }
}