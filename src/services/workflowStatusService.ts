import { QuoteService } from './database/quoteService';
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowStageUpdate {
  stage: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  payment_status?: string;
  additionalData?: Record<string, any>;
}

export class WorkflowStatusService {
  // Valid enum values for quote status
  private static readonly VALID_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'];

  /**
   * Comprehensive workflow update that handles stage, status, and payment status atomically
   */
  static async updateQuoteWorkflowStage(
    quoteId: string, 
    update: WorkflowStageUpdate
  ): Promise<void> {
    try {
      console.log('🔄 WorkflowStatusService: Starting comprehensive update for quote:', quoteId);
      console.log('📋 Update details:', update);
      
      // Build the update object
      const updateData: any = {
        workflow_stage: update.stage,
        updated_at: new Date().toISOString()
      };

      // Add status if provided and valid
      if (update.status && this.VALID_STATUSES.includes(update.status)) {
        updateData.status = update.status;
        console.log('✅ Status update included:', update.status);
      } else if (update.status) {
        console.warn(`⚠️ Invalid status value: ${update.status}. Valid values: ${this.VALID_STATUSES.join(', ')}`);
      }

      // Add payment status if provided
      if (update.payment_status) {
        updateData.payment_status = update.payment_status;
        console.log('✅ Payment status update included:', update.payment_status);
      }

      // Add any additional data
      if (update.additionalData) {
        Object.assign(updateData, update.additionalData);
      }

      console.log('📤 Executing atomic update with data:', updateData);
      
      // Use the enhanced QuoteService batch update method
      const result = await QuoteService.updateWorkflowData(quoteId, updateData);
      
      console.log('✅ WorkflowStatusService: Comprehensive update completed successfully');
      console.log('📊 Updated quote data:', result);
      
    } catch (error) {
      console.error('❌ WorkflowStatusService: Failed to update workflow stage:', error);
      console.error('📋 Error context:', {
        quoteId,
        update,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Individual workflow stage update (safer for simple changes)
   */
  static async updateWorkflowStageOnly(quoteId: string, stage: string): Promise<void> {
    try {
      console.log('🔄 WorkflowStatusService: Updating workflow stage only:', { quoteId, stage });
      
      await QuoteService.updateWorkflowStage(quoteId, stage);
      
      console.log('✅ WorkflowStatusService: Workflow stage updated successfully');
    } catch (error) {
      console.error('❌ WorkflowStatusService: Failed to update workflow stage only:', error);
      throw error;
    }
  }

  /**
   * Individual payment status update
   */
  static async updatePaymentStatus(quoteId: string, paymentStatus: string): Promise<void> {
    try {
      console.log('🔄 WorkflowStatusService: Updating payment status:', { quoteId, paymentStatus });
      
      await QuoteService.updatePaymentStatus(quoteId, paymentStatus);
      
      console.log('✅ WorkflowStatusService: Payment status updated successfully');
    } catch (error) {
      console.error('❌ WorkflowStatusService: Failed to update payment status:', error);
      throw error;
    }
  }

  /**
   * Progressive workflow advancement with proper stage mapping
   */
  static async progressToNextStage(quoteId: string, currentStage: string): Promise<void> {
    const stageFlow = {
      'quote-drafting': { stage: 'rfq-generation', status: 'sent' as const },
      'rfq-generation': { stage: 'insurer-matching', status: 'sent' as const },
      'insurer-matching': { stage: 'quote-evaluation', status: 'sent' as const },
      'quote-evaluation': { stage: 'client-selection', status: 'sent' as const },
      'client-selection': { stage: 'client_approved', status: 'accepted' as const, payment_status: 'pending' },
      'client_approved': { stage: 'payment-processing', status: 'accepted' as const, payment_status: 'pending' },
      'payment-processing': { stage: 'contract-generation', status: 'accepted' as const, payment_status: 'completed' },
      'contract-generation': { stage: 'completed', status: 'accepted' as const, payment_status: 'completed' },
    };

    const nextStageInfo = stageFlow[currentStage as keyof typeof stageFlow];
    
    if (nextStageInfo) {
      console.log(`📈 Progressing from ${currentStage} to ${nextStageInfo.stage}`);
      await this.updateQuoteWorkflowStage(quoteId, nextStageInfo);
    } else {
      console.warn(`⚠️ No progression defined for stage: ${currentStage}`);
    }
  }

  /**
   * Force workflow sync using database function and ensure consistency
   */
  static async forceWorkflowSync(quoteId: string): Promise<void> {
    try {
      console.log('🔄 WorkflowStatusService: Force syncing workflow for quote:', quoteId);
      
      // Use the database function to sync status
      const { data, error } = await supabase.rpc('sync_quote_workflow_status', {
        quote_id_param: quoteId
      });

      if (error) {
        console.error('❌ Database sync function failed:', error);
        throw error;
      }

      console.log('📊 Database sync result:', data);
      
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
      console.error('❌ WorkflowStatusService: Failed to force sync workflow:', error);
      throw error;
    }
  }

  static getStageDisplayName(stage: string): string {
    const stageNames = {
      'quote-drafting': 'Quote Drafting',
      'rfq-generation': 'RFQ Generation',
      'insurer-matching': 'Insurer Matching',
      'quote-evaluation': 'Quote Evaluation',
      'client-selection': 'Client Selection',
      'client_approved': 'Client Approved',
      'payment-processing': 'Payment Processing',
      'contract-generation': 'Contract Generation',
      'completed': 'Completed'
    };

    return stageNames[stage as keyof typeof stageNames] || stage;
  }

  static getStageColor(stage: string): string {
    const stageColors = {
      'quote-drafting': 'bg-gray-500',
      'rfq-generation': 'bg-blue-500',
      'insurer-matching': 'bg-purple-500',
      'quote-evaluation': 'bg-orange-500',
      'client-selection': 'bg-cyan-500',
      'client_approved': 'bg-green-600',
      'payment-processing': 'bg-emerald-500',
      'contract-generation': 'bg-green-500',
      'completed': 'bg-gray-800'
    };

    return stageColors[stage as keyof typeof stageColors] || 'bg-gray-500';
  }
}