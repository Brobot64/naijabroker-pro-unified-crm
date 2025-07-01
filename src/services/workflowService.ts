
import { supabase } from '@/integrations/supabase/client';

export interface Workflow {
  id: string;
  organization_id: string;
  workflow_type: string;
  reference_type: string;
  reference_id: string;
  status: string;
  current_step: number;
  total_steps: number;
  amount?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  assigned_to?: string;
  completed_at?: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_number: number;
  step_name: string;
  status: string;
  role_required: string;
  assigned_to?: string;
  approved_by?: string;
  approved_at?: string;
  comments?: string;
  created_at: string;
}

export interface CreateWorkflowData {
  workflow_type: string;
  reference_type: string;
  reference_id: string;
  amount?: number;
  metadata?: any;
}

export interface WorkflowStepData {
  step_name: string;
  role_required: string;
  assigned_to?: string;
}

export const workflowService = {
  async getWorkflows(filters?: any): Promise<{ data: Workflow[] | null; error: any }> {
    try {
      let query = supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.workflow_type) {
        query = query.eq('workflow_type', filters.workflow_type);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getPendingWorkflows(): Promise<{ data: Workflow[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async createWorkflow(workflowData: CreateWorkflowData): Promise<{ data: Workflow | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User organization not found');
      }

      // Create workflow
      const { data: workflow, error } = await supabase
        .from('workflows')
        .insert({
          organization_id: profile.organization_id,
          workflow_type: workflowData.workflow_type,
          reference_type: workflowData.reference_type,
          reference_id: workflowData.reference_id,
          amount: workflowData.amount,
          metadata: workflowData.metadata || {},
          created_by: user.id,
          status: 'pending',
          current_step: 1,
          total_steps: 1,
        })
        .select()
        .single();

      if (error) throw error;
      return { data: workflow, error: null };
    } catch (error) {
      console.error('Error creating workflow:', error);
      return { data: null, error };
    }
  },

  async addWorkflowSteps(workflowId: string, steps: WorkflowStepData[]): Promise<{ data: WorkflowStep[] | null; error: any }> {
    try {
      const workflowSteps = steps.map((step, index) => ({
        workflow_id: workflowId,
        step_number: index + 1,
        step_name: step.step_name,
        role_required: step.role_required,
        assigned_to: step.assigned_to,
        status: 'pending' as const,
      }));

      const { data, error } = await supabase
        .from('workflow_steps')
        .insert(workflowSteps)
        .select();

      if (error) throw error;

      // Update workflow total steps
      await supabase
        .from('workflows')
        .update({ total_steps: steps.length })
        .eq('id', workflowId);

      return { data, error: null };
    } catch (error) {
      console.error('Error adding workflow steps:', error);
      return { data: null, error };
    }
  },

  async processWorkflowStep(stepId: string, action: 'approve' | 'reject', comments?: string): Promise<{ data: any; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const status: 'approved' | 'rejected' = action === 'approve' ? 'approved' : 'rejected';

      // Update the workflow step
      const { data: step, error: stepError } = await supabase
        .from('workflow_steps')
        .update({
          status: status,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          comments: comments,
        })
        .eq('id', stepId)
        .select('workflow_id, step_number')
        .single();

      if (stepError) throw stepError;

      // Get the workflow and check if we should advance to next step
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .select('*, workflow_steps(*)')
        .eq('id', step.workflow_id)
        .single();

      if (workflowError) throw workflowError;

      if (action === 'approve') {
        // Check if this was the last step
        if (step.step_number >= workflow.total_steps) {
          // Complete the workflow
          await supabase
            .from('workflows')
            .update({
              status: 'approved',
              completed_at: new Date().toISOString(),
            })
            .eq('id', step.workflow_id);
        } else {
          // Advance to next step
          await supabase
            .from('workflows')
            .update({
              current_step: step.step_number + 1,
            })
            .eq('id', step.workflow_id);
        }
      } else {
        // Reject the entire workflow
        await supabase
          .from('workflows')
          .update({
            status: 'rejected',
            completed_at: new Date().toISOString(),
          })
          .eq('id', step.workflow_id);
      }

      return { data: step, error: null };
    } catch (error) {
      console.error('Error processing workflow step:', error);
      return { data: null, error };
    }
  }
};
