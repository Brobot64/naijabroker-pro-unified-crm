import { QuoteService } from './database/quoteService';

export interface WorkflowStageUpdate {
  stage: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  payment_status?: string;
  additionalData?: Record<string, any>;
}

export class WorkflowStatusService {
  // Valid enum values for quote status
  private static readonly VALID_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'];

  static async updateQuoteWorkflowStage(
    quoteId: string, 
    update: WorkflowStageUpdate
  ): Promise<void> {
    try {
      console.log('🔄 Updating quote workflow stage:', { quoteId, update });
      
      const updateData: any = {
        workflow_stage: update.stage,
        updated_at: new Date().toISOString()
      };

      // Always update status if provided - fix validation issue
      if (update.status) {
        if (this.VALID_STATUSES.includes(update.status)) {
          updateData.status = update.status;
          console.log('✅ Status update allowed:', update.status);
        } else {
          console.warn(`⚠️ Invalid status value: ${update.status}. Valid values: ${this.VALID_STATUSES.join(', ')}`);
          // Don't fail the entire update, just skip invalid status
        }
      }

      if (update.payment_status) {
        updateData.payment_status = update.payment_status;
      }

      if (update.additionalData) {
        Object.assign(updateData, update.additionalData);
      }

      console.log('📤 Update data being sent:', updateData);
      const result = await QuoteService.update(quoteId, updateData);
      console.log('✅ Quote updated successfully:', result);
      
    } catch (error) {
      console.error('❌ Failed to update workflow stage:', error);
      console.error('📋 Error details:', {
        quoteId,
        update,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Separate method for updating just workflow stage (safer)
  static async updateWorkflowStageOnly(quoteId: string, stage: string): Promise<void> {
    try {
      console.log('Updating workflow stage only:', { quoteId, stage });
      
      const result = await QuoteService.update(quoteId, {
        workflow_stage: stage,
        updated_at: new Date().toISOString()
      });
      
      console.log('Workflow stage updated successfully:', result);
    } catch (error) {
      console.error('Failed to update workflow stage only:', error);
      throw error;
    }
  }

  // Separate method for updating payment status
  static async updatePaymentStatus(quoteId: string, paymentStatus: string): Promise<void> {
    try {
      console.log('Updating payment status:', { quoteId, paymentStatus });
      
      const result = await QuoteService.update(quoteId, {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      });
      
      console.log('Payment status updated successfully:', result);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      throw error;
    }
  }

  static async progressToNextStage(quoteId: string, currentStage: string): Promise<void> {
    const stageFlow = {
      'quote-drafting': { stage: 'rfq-generation', status: 'sent' as const },
      'rfq-generation': { stage: 'insurer-matching', status: 'sent' as const },
      'insurer-matching': { stage: 'quote-evaluation', status: 'sent' as const },
      'quote-evaluation': { stage: 'client-selection', status: 'sent' as const },
      'client-selection': { stage: 'client_approved', status: 'sent' as const, payment_status: 'pending' },
      'client_approved': { stage: 'payment-processing', status: 'sent' as const, payment_status: 'pending' },
      'payment-processing': { stage: 'contract-generation', status: 'accepted' as const, payment_status: 'completed' },
      'contract-generation': { stage: 'completed', status: 'accepted' as const, payment_status: 'completed' },
    };

    const nextStageInfo = stageFlow[currentStage as keyof typeof stageFlow];
    
    if (nextStageInfo) {
      await this.updateQuoteWorkflowStage(quoteId, nextStageInfo);
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