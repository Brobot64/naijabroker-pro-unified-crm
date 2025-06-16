export interface ApprovalLimit {
  roleId: string;
  maxAmount: number;
  autoApprove: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  roleRequired: string;
  approvalLimit?: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  comments?: string;
}

export interface NotificationTemplate {
  type: 'email' | 'sms';
  subject: string;
  template: string;
  recipients: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export class WorkflowManager {
  private approvalLimits: Record<string, ApprovalLimit[]> = {
    'underwriting': [
      { roleId: 'SuperAdmin', maxAmount: 50000000, autoApprove: false },
      { roleId: 'BrokerAdmin', maxAmount: 10000000, autoApprove: false },
      { roleId: 'Underwriter', maxAmount: 5000000, autoApprove: true },
      { roleId: 'Agent', maxAmount: 1000000, autoApprove: true }
    ],
    'claims': [
      { roleId: 'SuperAdmin', maxAmount: 100000000, autoApprove: false },
      { roleId: 'BrokerAdmin', maxAmount: 50000000, autoApprove: false },
      { roleId: 'Underwriter', maxAmount: 10000000, autoApprove: true },
      { roleId: 'Compliance', maxAmount: 5000000, autoApprove: true },
      { roleId: 'ClaimsManager', maxAmount: 2000000, autoApprove: true }
    ],
    'payments': [
      { roleId: 'SuperAdmin', maxAmount: 200000000, autoApprove: false },
      { roleId: 'BrokerAdmin', maxAmount: 100000000, autoApprove: false }
    ],
    'remittance': [
      { roleId: 'SuperAdmin', maxAmount: 500000000, autoApprove: false },
      { roleId: 'BrokerAdmin', maxAmount: 50000000, autoApprove: false }
    ]
  };

  requiresApproval(workflowType: string, amount: number, userRole: string): boolean {
    const limits = this.approvalLimits[workflowType] || [];
    const userLimit = limits.find(limit => limit.roleId === userRole);
    
    if (!userLimit) return true;
    return amount > userLimit.maxAmount || !userLimit.autoApprove;
  }

  getNextApprover(workflowType: string, amount: number, currentRole: string): string | null {
    const limits = this.approvalLimits[workflowType] || [];
    const sortedLimits = limits.sort((a, b) => b.maxAmount - a.maxAmount);
    
    for (const limit of sortedLimits) {
      if (amount <= limit.maxAmount && limit.roleId !== currentRole) {
        return limit.roleId;
      }
    }
    return 'SuperAdmin';
  }

  generateNotification(type: string, data: any): NotificationTemplate {
    const templates: Record<string, NotificationTemplate> = {
      'quote_ready': {
        type: 'email',
        subject: 'Quote Ready for Review',
        template: `Dear ${data.clientName}, your quote ${data.quoteId} is ready for review. Please log in to your portal to view details.`,
        recipients: [data.clientEmail],
        priority: 'medium'
      },
      'approval_required': {
        type: 'email',
        subject: 'Approval Required - High Value Transaction',
        template: `A ${data.workflowType} transaction requires your approval. Amount: ₦${data.amount.toLocaleString()}. Please review and approve via your dashboard.`,
        recipients: [data.approverEmail],
        priority: 'high'
      },
      'policy_renewal': {
        type: 'email',
        subject: 'Policy Renewal Reminder',
        template: `Your policy ${data.policyNumber} expires on ${data.expiryDate}. Please contact us to renew and avoid coverage gaps.`,
        recipients: [data.clientEmail],
        priority: 'high'
      },
      'claim_registered': {
        type: 'email',
        subject: 'Claim Registration Confirmation',
        template: `Your claim ${data.claimNumber} has been registered successfully. Our team will contact you within 24 hours to begin the investigation process.`,
        recipients: [data.clientEmail],
        priority: 'high'
      },
      'claim_investigation_assigned': {
        type: 'email',
        subject: 'Claim Investigation Assignment',
        template: `Claim ${data.claimNumber} has been assigned to you for investigation. Please review the claim details and begin your assessment within 48 hours.`,
        recipients: [data.adjusterEmail],
        priority: 'high'
      },
      'claim_update': {
        type: 'email',
        subject: 'Claim Status Update',
        template: `Your claim ${data.claimNumber} status has been updated to ${data.status}. ${data.additionalInfo || ''}`,
        recipients: [data.clientEmail],
        priority: 'medium'
      },
      'settlement_processed': {
        type: 'email',
        subject: 'Claim Settlement Processed',
        template: `Settlement for claim ${data.claimNumber} has been processed. Amount: ₦${data.settlementAmount.toLocaleString()}. Payment will be issued within 5 business days.`,
        recipients: [data.clientEmail],
        priority: 'high'
      },
      'discharge_voucher_ready': {
        type: 'email',
        subject: 'Discharge Voucher Ready for Collection',
        template: `Discharge voucher ${data.voucherNumber} for claim ${data.claimNumber} is ready for collection. Amount: ₦${data.voucherAmount.toLocaleString()}.`,
        recipients: [data.underwriterEmail],
        priority: 'high'
      },
      'compliance_alert': {
        type: 'email',
        subject: 'Compliance Alert - Action Required',
        template: `A compliance issue requires your attention: ${data.alertType}. Please review and take appropriate action within the specified timeframe.`,
        recipients: [data.complianceOfficerEmail],
        priority: 'urgent'
      },
      'audit_notification': {
        type: 'email',
        subject: 'Audit Trail Update',
        template: `New audit entry recorded: ${data.action} on ${data.resource}. Review required for compliance monitoring.`,
        recipients: [data.auditOfficerEmail],
        priority: 'medium'
      },
      'payment_received': {
        type: 'email',
        subject: 'Payment Confirmation',
        template: `We have received your payment of ₦${data.amount.toLocaleString()} for policy ${data.policyNumber}. Receipt attached.`,
        recipients: [data.clientEmail],
        priority: 'medium'
      },
      'remittance_ready': {
        type: 'email',
        subject: 'Remittance Advice Ready',
        template: `Remittance advice ${data.remittanceId} for ₦${data.amount.toLocaleString()} is ready for processing.`,
        recipients: [data.underwriterEmail],
        priority: 'high'
      }
    };

    return templates[type] || templates['approval_required'];
  }

  // Enhanced workflow with configurable thresholds and claims-specific steps
  createWorkflow(type: string, amount: number, initiatorRole: string): WorkflowStep[] {
    const steps: WorkflowStep[] = [];
    
    if (type === 'claims') {
      // Claims-specific workflow steps
      if (amount > 1000000) { // High-value claims require additional approvals
        steps.push({
          id: `claims-compliance-${Date.now()}`,
          name: 'Compliance Review Required',
          roleRequired: 'Compliance',
          approvalLimit: amount,
          status: 'pending'
        });
      }
      
      if (amount > 5000000) { // Very high-value claims need underwriter approval
        steps.push({
          id: `claims-underwriter-${Date.now()}`,
          name: 'Underwriter Approval Required',
          roleRequired: 'Underwriter',
          approvalLimit: amount,
          status: 'pending'
        });
      }
    }
    
    if (this.requiresApproval(type, amount, initiatorRole)) {
      const nextApprover = this.getNextApprover(type, amount, initiatorRole);
      if (nextApprover) {
        steps.push({
          id: `${type}-approval-${Date.now()}`,
          name: `${type} Approval Required`,
          roleRequired: nextApprover,
          approvalLimit: amount,
          status: 'pending'
        });
      }
    }
    
    return steps;
  }

  // New method for claims workflow validation
  validateClaimsWorkflow(claimData: any): { canProceed: boolean; requiredSteps: string[] } {
    const requiredSteps: string[] = [];
    let canProceed = true;

    // Check if investigation is complete
    if (!claimData.investigationComplete) {
      requiredSteps.push('Investigation must be completed');
      canProceed = false;
    }

    // Check if settlement amount is within adjuster authority
    if (claimData.settlementAmount > 2000000 && !claimData.underwriterApproval) {
      requiredSteps.push('Underwriter approval required for settlements above ₦2M');
      canProceed = false;
    }

    // Check if all documents are submitted
    if (!claimData.documentsComplete) {
      requiredSteps.push('All supporting documents must be submitted');
      canProceed = false;
    }

    return { canProceed, requiredSteps };
  }
}

export const workflowManager = new WorkflowManager();
