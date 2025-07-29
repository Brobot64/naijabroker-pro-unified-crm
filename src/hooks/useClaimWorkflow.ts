import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ClaimWorkflowService } from '@/services/database/claimWorkflowService';
import { ClaimService } from '@/services/database/claimService';
import { Claim } from '@/services/database/types';
import { logClaimStatusTransition, logClaimDeletion, logClaimAssignment } from '@/utils/claimAuditLogger';

interface ClaimTransition {
  from: string;
  to: string;
  label: string;
  description: string;
  requiresNotes?: boolean;
}

const CLAIM_TRANSITIONS: Record<string, ClaimTransition[]> = {
  'registered': [
    {
      from: 'registered',
      to: 'investigating',
      label: 'Start Investigation',
      description: 'Begin claim investigation process'
    },
    {
      from: 'registered', 
      to: 'rejected',
      label: 'Reject Claim',
      description: 'Reject claim due to policy violations',
      requiresNotes: true
    }
  ],
  'investigating': [
    {
      from: 'investigating',
      to: 'assessed',
      label: 'Complete Assessment',
      description: 'Mark investigation complete and ready for approval'
    },
    {
      from: 'investigating',
      to: 'rejected', 
      label: 'Reject Claim',
      description: 'Reject claim based on investigation findings',
      requiresNotes: true
    }
  ],
  'assessed': [
    {
      from: 'assessed',
      to: 'approved',
      label: 'Approve Claim',
      description: 'Approve claim for settlement'
    },
    {
      from: 'assessed',
      to: 'rejected',
      label: 'Reject Claim', 
      description: 'Reject claim after assessment',
      requiresNotes: true
    }
  ],
  'approved': [
    {
      from: 'approved',
      to: 'settled',
      label: 'Mark as Settled',
      description: 'Confirm claim settlement payment'
    }
  ],
  'settled': [
    {
      from: 'settled',
      to: 'closed',
      label: 'Close Claim',
      description: 'Close claim after settlement completion'
    }
  ]
};

export const useClaimWorkflow = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getAvailableTransitions = (currentStatus: string): ClaimTransition[] => {
    return CLAIM_TRANSITIONS[currentStatus] || [];
  };

  const transitionClaim = async (
    claimId: string,
    newStatus: string,
    notes?: string
  ): Promise<Claim | null> => {
    setLoading(true);
    try {
      console.log('🔄 useClaimWorkflow: Transitioning claim:', claimId, 'to status:', newStatus);

      // Get current claim to log transition
      const currentClaim = await ClaimService.getById(claimId);
      const oldStatus = currentClaim?.status || 'unknown';

      const updatedClaim = await ClaimWorkflowService.updateStatus(claimId, newStatus, notes);

      // Log the status transition with audit trail
      if (updatedClaim) {
        await logClaimStatusTransition(
          claimId,
          updatedClaim.organization_id,
          oldStatus,
          newStatus,
          undefined, // TODO: Get current user ID
          notes
        );
      }

      console.log('✅ Claim transition completed successfully');
      
      toast({
        title: "Claim Updated",
        description: `Claim status updated to ${newStatus.replace('_', ' ')}`,
      });

      return updatedClaim;
    } catch (error) {
      console.error('❌ useClaimWorkflow: Transition failed:', error);
      
      toast({
        title: "Transition Failed",
        description: error instanceof Error ? error.message : "Failed to update claim status",
        variant: "destructive"
      });

      return null;
    } finally {
      setLoading(false);
    }
  };

  const assignAdjuster = async (claimId: string, adjusterId: string): Promise<Claim | null> => {
    setLoading(true);
    try {
      const updatedClaim = await ClaimWorkflowService.assignAdjuster(claimId, adjusterId);
      
      // Log the assignment
      if (updatedClaim) {
        await logClaimAssignment(
          claimId,
          updatedClaim.organization_id,
          adjusterId,
          undefined // TODO: Get current user ID
        );
      }
      
      toast({
        title: "Adjuster Assigned",
        description: "Claim has been assigned to an adjuster",
      });

      return updatedClaim;
    } catch (error) {
      console.error('❌ useClaimWorkflow: Assign adjuster failed:', error);
      
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "Failed to assign adjuster",
        variant: "destructive"
      });

      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteClaim = async (claimId: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Get claim details before deletion for audit log
      const claim = await ClaimService.getById(claimId);
      
      // Delete the claim - note: this should check permissions
      await ClaimService.delete(claimId);

      // Log the deletion
      if (claim) {
        await logClaimDeletion(
          claimId,
          claim.organization_id,
          claim.claim_number,
          undefined, // TODO: Get current user ID
          'User initiated deletion'
        );
      }

      toast({
        title: "Claim Deleted",
        description: "Claim has been deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('❌ useClaimWorkflow: Delete failed:', error);
      
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete claim",
        variant: "destructive"
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  const canTransition = (currentStatus: string, targetStatus: string): boolean => {
    const transitions = getAvailableTransitions(currentStatus);
    return transitions.some(t => t.to === targetStatus);
  };

  return {
    getAvailableTransitions,
    transitionClaim,
    assignAdjuster,
    deleteClaim,
    canTransition,
    loading
  };
};