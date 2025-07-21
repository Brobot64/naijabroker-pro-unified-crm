import { QuoteService } from './database/quoteService';

export interface WorkflowStageUpdate {
  stage: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  payment_status?: string;
  additionalData?: Record<string, any>;
}

export class WorkflowStatusService {
  static async updateQuoteWorkflowStage(
    quoteId: string, 
    update: WorkflowStageUpdate
  ): Promise<void> {
    try {
      const updateData: any = {
        workflow_stage: update.stage,
      };

      if (update.status) {
        updateData.status = update.status;
      }

      if (update.payment_status) {
        updateData.payment_status = update.payment_status;
      }

      if (update.additionalData) {
        Object.assign(updateData, update.additionalData);
      }

      await QuoteService.update(quoteId, updateData);
    } catch (error) {
      console.error('Failed to update workflow stage:', error);
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