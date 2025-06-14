
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
}

export class WorkflowManager {
  private approvalLimits: Record<string, ApprovalLimit[]> = {
    'underwriting': [
      { roleId: 'BrokerAdmin', maxAmount: 10000000, autoApprove: false },
      { roleId: 'Underwriter', maxAmount: 5000000, autoApprove: true },
      { roleId: 'Agent', maxAmount: 1000000, autoApprove: true }
    ],
    'claims': [
      { roleId: 'BrokerAdmin', maxAmount: 50000000, autoApprove: false },
      { roleId: 'ClaimsOfficer', maxAmount: 10000000, autoApprove: true },
      { roleId: 'Underwriter', maxAmount: 5000000, autoApprove: true }
    ],
    'payments': [
      { roleId: 'BrokerAdmin', maxAmount: 100000000, autoApprove: false },
      { roleId: 'FinanceOfficer', maxAmount: 20000000, autoApprove: true }
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
    return 'BrokerAdmin';
  }

  generateNotification(type: string, data: any): NotificationTemplate {
    const templates: Record<string, NotificationTemplate> = {
      'quote_ready': {
        type: 'email',
        subject: 'Quote Ready for Review',
        template: `Dear ${data.clientName}, your quote ${data.quoteId} is ready for review.`,
        recipients: [data.clientEmail]
      },
      'approval_required': {
        type: 'email',
        subject: 'Approval Required',
        template: `A ${data.workflowType} transaction requires your approval. Amount: ₦${data.amount.toLocaleString()}`,
        recipients: [data.approverEmail]
      },
      'policy_renewal': {
        type: 'email',
        subject: 'Policy Renewal Reminder',
        template: `Your policy ${data.policyNumber} expires on ${data.expiryDate}. Please contact us to renew.`,
        recipients: [data.clientEmail]
      }
    };

    return templates[type] || templates['approval_required'];
  }
}

export const workflowManager = new WorkflowManager();
