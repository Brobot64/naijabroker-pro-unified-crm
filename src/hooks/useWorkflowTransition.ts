import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WorkflowSyncService } from '@/services/workflowSyncService';
import { ClientPortalLinkService } from '@/services/clientPortalLinkService';
import { QuoteStatusSync } from '@/utils/quoteStatusSync';

interface WorkflowTransition {
  from: string;
  to: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  paymentStatus?: string;
  requiresPortalLink?: boolean;
  requiresPaymentTransaction?: boolean;
}

const WORKFLOW_TRANSITIONS: Record<string, WorkflowTransition> = {
  'quote-evaluation': {
    from: 'quote-evaluation',
    to: 'client-selection',
    status: 'sent',
    requiresPortalLink: true
  },
  'client-selection': {
    from: 'client-selection',
    to: 'client_approved',
    status: 'accepted',
    paymentStatus: 'pending',
    requiresPaymentTransaction: true
  },
  'client_approved': {
    from: 'client_approved',
    to: 'payment-processing',
    status: 'accepted',
    paymentStatus: 'pending',
    requiresPaymentTransaction: true
  },
  'payment-processing': {
    from: 'payment-processing',
    to: 'contract-generation',
    status: 'accepted',
    paymentStatus: 'completed'
  },
  'contract-generation': {
    from: 'contract-generation',
    to: 'completed',
    status: 'accepted',
    paymentStatus: 'completed'
  }
};

/**
 * Hook for managing workflow transitions with automatic requirements handling
 */
export const useWorkflowTransition = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const transitionWorkflow = async (
    quoteId: string,
    currentStage: string,
    forceStage?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('🔄 useWorkflowTransition: Starting transition for quote:', quoteId, 'from stage:', currentStage);

      const transition = WORKFLOW_TRANSITIONS[currentStage];
      if (!transition && !forceStage) {
        console.warn('⚠️ No transition defined for stage:', currentStage);
        return false;
      }

      const targetStage = forceStage || transition.to;
      const targetStatus = transition?.status;
      const paymentStatus = transition?.paymentStatus;

      // Handle automatic requirements
      if (transition?.requiresPortalLink) {
        console.log('🔗 Creating client portal link...');
        await ClientPortalLinkService.ensureClientPortalLink(quoteId);
      }

      // Progress the workflow
      await WorkflowSyncService.progressWorkflow(
        quoteId,
        targetStage,
        targetStatus,
        paymentStatus
      );

      // Force refresh quote status
      await QuoteStatusSync.refreshQuoteStatus(quoteId);

      console.log('✅ Workflow transition completed successfully');
      
      toast({
        title: "Workflow Updated",
        description: `Quote moved to ${targetStage.replace('-', ' ').replace('_', ' ')} stage`,
      });

      return true;
    } catch (error) {
      console.error('❌ useWorkflowTransition: Transition failed:', error);
      
      toast({
        title: "Transition Failed",
        description: "Failed to update workflow stage",
        variant: "destructive"
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  const canTransition = (currentStage: string): boolean => {
    return WORKFLOW_TRANSITIONS.hasOwnProperty(currentStage);
  };

  const getNextStage = (currentStage: string): string | null => {
    const transition = WORKFLOW_TRANSITIONS[currentStage];
    return transition ? transition.to : null;
  };

  return {
    transitionWorkflow,
    canTransition,
    getNextStage,
    loading
  };
};