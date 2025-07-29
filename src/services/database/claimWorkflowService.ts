import { supabase } from '@/integrations/supabase/client';
import { Claim, ClaimInsert, ClaimUpdate } from './types';
import { ClaimService } from './claimService';

export class ClaimWorkflowService {
  // Enhanced claim creation with workflow initialization
  static async createWithWorkflow(claimData: {
    client_name: string;
    policy_number: string;
    claim_type: string;
    incident_date: string;
    description?: string;
    estimated_loss: number;
  }): Promise<Claim> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) throw new Error('User organization not found');

    // Generate claim number using SQL function (direct query)
    const { data: claimNumberResult, error: numberError } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profile.organization_id)
      .single();

    if (numberError) throw numberError;

    // Generate claim number manually (temporary until function is available in types)
    const orgPrefix = claimNumberResult.name?.substring(0, 3).toUpperCase() || 'ORG';
    const timestamp = Date.now().toString().slice(-4);
    const claimNumber = `${orgPrefix}C${timestamp}`;

    // Create claim with generated number
    const claim = await ClaimService.create({
      ...claimData,
      claim_number: claimNumber,
      organization_id: profile.organization_id,
      created_by: user.id,
      status: 'registered',
      reported_date: new Date().toISOString().split('T')[0],
      policy_id: 'temp-policy-id' // Will be updated when policy integration is complete
    });

    // Log claim creation
    await this.logClaimActivity(claim.id, 'CLAIM_REGISTERED', 'registered', {
      claim_number: claim.claim_number,
      claim_type: claim.claim_type,
      estimated_loss: claim.estimated_loss
    });

    return claim;
  }

  // Update claim status with validation and logging
  static async updateStatus(claimId: string, newStatus: string, notes?: string): Promise<Claim> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate user can make this status change
    const { data: canUpdate, error: validationError } = await supabase
      .rpc('can_update_claim_status', {
        _user_id: user.id,
        _claim_id: claimId,
        _new_status: newStatus
      });

    if (validationError) throw validationError;
    if (!canUpdate) throw new Error('Insufficient permissions to update claim status');

    // Get current claim for validation
    const { data: currentClaim, error: fetchError } = await supabase
      .from('claims')
      .select('status')
      .eq('id', claimId)
      .single();

    if (fetchError) throw fetchError;

    // Validate transition
    const { data: isValidTransition, error: transitionError } = await supabase
      .rpc('validate_claim_workflow_transition', {
        _claim_id: claimId,
        _from_status: currentClaim.status,
        _to_status: newStatus
      });

    if (transitionError) throw transitionError;
    if (!isValidTransition) throw new Error(`Invalid status transition from ${currentClaim.status} to ${newStatus}`);

    // Update claim status
    const { data: updatedClaim, error: updateError } = await supabase
      .from('claims')
      .update({
        status: newStatus as any,
        updated_at: new Date().toISOString(),
        ...(notes && { notes })
      })
      .eq('id', claimId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log status change
    await this.logClaimActivity(claimId, 'STATUS_UPDATED', newStatus, {
      old_status: currentClaim.status,
      new_status: newStatus,
      notes,
      updated_by: user.id
    });

    return updatedClaim;
  }

  // Assign claim to adjuster
  static async assignAdjuster(claimId: string, adjusterId: string): Promise<Claim> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: updatedClaim, error } = await supabase
      .from('claims')
      .update({
        assigned_adjuster: adjusterId,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .select()
      .single();

    if (error) throw error;

    await this.logClaimActivity(claimId, 'ADJUSTER_ASSIGNED', updatedClaim.status, {
      assigned_adjuster: adjusterId,
      assigned_by: user.id
    });

    return updatedClaim;
  }

  // Get claims by workflow stage/status
  static async getByStatus(status: 'registered' | 'investigating' | 'assessed' | 'approved' | 'settled' | 'rejected' | 'closed'): Promise<Claim[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: claims, error } = await supabase
      .from('claims')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return claims || [];
  }

  // Get claims assigned to current user
  static async getAssignedToUser(): Promise<Claim[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: claims, error } = await supabase
      .from('claims')
      .select('*')
      .eq('assigned_adjuster', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return claims || [];
  }

  // Get claims requiring action (SLA breaches, idle claims)
  static async getActionableInsights(): Promise<{
    idleClaims: Claim[];
    slaBreaches: Claim[];
    pendingApproval: Claim[];
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get idle claims (no status update in 3+ days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: idleClaims, error: idleError } = await supabase
      .from('claims')
      .select('*')
      .not('status', 'in', '(settled,closed,rejected)')
      .lt('updated_at', threeDaysAgo.toISOString())
      .order('updated_at', { ascending: true });

    if (idleError) throw idleError;

    // Get SLA breaches (registered > 2 days, investigating > 5 days)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const { data: slaBreaches, error: slaError } = await supabase
      .from('claims')
      .select('*')
      .or(`and(status.eq.registered,created_at.lt.${twoDaysAgo.toISOString()}),and(status.eq.investigating,updated_at.lt.${fiveDaysAgo.toISOString()})`)
      .order('created_at', { ascending: true });

    if (slaError) throw slaError;

    // Get claims pending approval
    const { data: pendingApproval, error: approvalError } = await supabase
      .from('claims')
      .select('*')
      .eq('status', 'assessed')
      .order('updated_at', { ascending: true });

    if (approvalError) throw approvalError;

    return {
      idleClaims: idleClaims || [],
      slaBreaches: slaBreaches || [],
      pendingApproval: pendingApproval || []
    };
  }

  // Log claim activity for audit trail
  static async logClaimActivity(
    claimId: string,
    action: string,
    stage: string,
    details?: any
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) return;

    await supabase
      .from('audit_logs')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        action,
        resource_type: 'claim',
        resource_id: claimId,
        new_values: {
          stage,
          ...details
        },
        metadata: {
          claim_id: claimId,
          timestamp: new Date().toISOString()
        }
      });
  }

  // Get claim audit trail
  static async getAuditTrail(claimId: string): Promise<any[]> {
    const { data: auditLogs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_type', 'claim')
      .eq('resource_id', claimId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return auditLogs || [];
  }

  // Bulk status update for multiple claims
  static async bulkUpdateStatus(claimIds: string[], newStatus: string): Promise<Claim[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updatedClaims: Claim[] = [];

    for (const claimId of claimIds) {
      try {
        const claim = await this.updateStatus(claimId, newStatus);
        updatedClaims.push(claim);
      } catch (error) {
        console.error(`Failed to update claim ${claimId}:`, error);
      }
    }

    return updatedClaims;
  }
}