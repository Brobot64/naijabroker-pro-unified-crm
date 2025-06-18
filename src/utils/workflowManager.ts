
import { workflowService } from '@/services/workflowService';

export interface WorkflowConfig {
  type: string;
  steps: {
    name: string;
    role: string;
    threshold?: number;
  }[];
}

// Predefined workflow configurations
export const workflowConfigs: Record<string, WorkflowConfig> = {
  POLICY_APPROVAL: {
    type: 'Policy Approval',
    steps: [
      { name: 'Underwriter Review', role: 'Underwriter' },
      { name: 'Manager Approval', role: 'BrokerAdmin' }
    ]
  },
  CLAIM_SETTLEMENT: {
    type: 'Claim Settlement',
    steps: [
      { name: 'Claims Assessment', role: 'Underwriter' },
      { name: 'Settlement Approval', role: 'BrokerAdmin' }
    ]
  },
  FINANCIAL_TRANSACTION: {
    type: 'Financial Transaction',
    steps: [
      { name: 'Financial Review', role: 'BrokerAdmin', threshold: 100000 }
    ]
  },
  QUOTE_APPROVAL: {
    type: 'Quote Approval',
    steps: [
      { name: 'Quote Review', role: 'Underwriter' },
      { name: 'Final Approval', role: 'BrokerAdmin' }
    ]
  }
};

export class WorkflowManager {
  static async createApprovalWorkflow(
    referenceType: string,
    referenceId: string,
    workflowType: keyof typeof workflowConfigs,
    amount?: number,
    metadata?: any
  ) {
    try {
      const config = workflowConfigs[workflowType];
      if (!config) {
        throw new Error(`Workflow configuration not found for type: ${workflowType}`);
      }

      // Filter steps based on threshold if amount is provided
      let applicableSteps = config.steps;
      if (amount !== undefined) {
        applicableSteps = config.steps.filter(step => 
          !step.threshold || amount >= step.threshold
        );
      }

      if (applicableSteps.length === 0) {
        console.log('No approval workflow required based on amount threshold');
        return { data: null, error: null };
      }

      // Create the workflow
      const { data: workflow, error: workflowError } = await workflowService.createWorkflow({
        workflow_type: config.type,
        reference_type: referenceType,
        reference_id: referenceId,
        amount: amount,
        metadata: metadata
      });

      if (workflowError || !workflow) {
        throw workflowError || new Error('Failed to create workflow');
      }

      // Add workflow steps
      const steps = applicableSteps.map(step => ({
        step_name: step.name,
        role_required: step.role,
      }));

      const { error: stepsError } = await workflowService.addWorkflowSteps(workflow.id, steps);
      if (stepsError) {
        throw stepsError;
      }

      console.log(`Created ${config.type} workflow with ${steps.length} steps`);
      return { data: workflow, error: null };
    } catch (error) {
      console.error('Error creating approval workflow:', error);
      return { data: null, error };
    }
  }

  static async requiresApproval(
    workflowType: keyof typeof workflowConfigs,
    amount?: number
  ): Promise<boolean> {
    const config = workflowConfigs[workflowType];
    if (!config) return false;

    if (amount !== undefined) {
      // Check if any step's threshold is met
      return config.steps.some(step => !step.threshold || amount >= step.threshold);
    }

    return config.steps.length > 0;
  }

  static getWorkflowConfig(workflowType: keyof typeof workflowConfigs) {
    return workflowConfigs[workflowType];
  }
}

// Legacy exports for backward compatibility
export const createApprovalWorkflow = WorkflowManager.createApprovalWorkflow;
export const requiresApproval = WorkflowManager.requiresApproval;
