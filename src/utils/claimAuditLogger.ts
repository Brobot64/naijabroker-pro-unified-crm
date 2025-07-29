import { supabase } from "@/integrations/supabase/client";

interface ClaimAuditLogEntry {
  action: string;
  stage: string;
  claim_id: string;
  organization_id: string;
  user_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
}

export const logClaimAction = async (entry: ClaimAuditLogEntry) => {
  try {
    // Get client IP and user agent (in a real app, this would come from request headers)
    const clientInfo = {
      ip_address: entry.ip_address || 'unknown',
      user_agent: entry.user_agent || navigator.userAgent.slice(0, 255) // Truncate to avoid DB limits
    };

    const { error } = await supabase
      .from('claim_audit_trail')
      .insert({
        ...entry,
        ...clientInfo,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging claim audit entry:', error);
    }
  } catch (error) {
    console.error('Failed to log claim audit entry:', error);
  }
};

export const logClaimWorkflowStage = async (
  claimId: string,
  organizationId: string,
  stage: string,
  action: string,
  details?: any,
  userId?: string
) => {
  await logClaimAction({
    action,
    stage,
    claim_id: claimId,
    organization_id: organizationId,
    user_id: userId,
    details
  });
};

export const logClaimStatusTransition = async (
  claimId: string,
  organizationId: string,
  fromStatus: string,
  toStatus: string,
  userId?: string,
  notes?: string
) => {
  await logClaimAction({
    action: 'status_transition',
    stage: toStatus,
    claim_id: claimId,
    organization_id: organizationId,
    user_id: userId,
    details: {
      from_status: fromStatus,
      to_status: toStatus,
      notes,
      transition_timestamp: new Date().toISOString()
    }
  });
};

export const logClaimDeletion = async (
  claimId: string,
  organizationId: string,
  claimNumber: string,
  userId?: string,
  reason?: string
) => {
  await logClaimAction({
    action: 'claim_deleted',
    stage: 'deleted',
    claim_id: claimId,
    organization_id: organizationId,
    user_id: userId,
    details: {
      claim_number: claimNumber,
      deletion_reason: reason,
      deletion_timestamp: new Date().toISOString()
    }
  });
};

export const logClaimAssignment = async (
  claimId: string,
  organizationId: string,
  adjusterId: string,
  userId?: string
) => {
  await logClaimAction({
    action: 'adjuster_assigned',
    stage: 'assignment',
    claim_id: claimId,
    organization_id: organizationId,
    user_id: userId,
    details: {
      assigned_adjuster_id: adjusterId,
      assignment_timestamp: new Date().toISOString()
    }
  });
};

export const logClaimCreation = async (
  claimId: string,
  organizationId: string,
  claimData: any,
  userId?: string
) => {
  await logClaimAction({
    action: 'claim_created',
    stage: 'registration',
    claim_id: claimId,
    organization_id: organizationId,
    user_id: userId,
    details: {
      claim_number: claimData.claim_number,
      client_name: claimData.client_name,
      policy_number: claimData.policy_number,
      claim_type: claimData.claim_type,
      estimated_loss: claimData.estimated_loss,
      creation_timestamp: new Date().toISOString()
    }
  });
};