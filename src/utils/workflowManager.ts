
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
      { roleId: 'Compliance', maxAmount: 5000000, autoApprove: true }
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
      'claim_update': {
        type: 'email',
        subject: 'Claim Status Update',
        template: `Your claim ${data.claimNumber} status has been updated to ${data.status}. ${data.additionalInfo || ''}`,
        recipients: [data.clientEmail],
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

  // Enhanced workflow with configurable thresholds
  createWorkflow(type: string, amount: number, initiatorRole: string): WorkflowStep[] {
    const steps: WorkflowStep[] = [];
    
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
}

export const workflowManager = new WorkflowManager();
