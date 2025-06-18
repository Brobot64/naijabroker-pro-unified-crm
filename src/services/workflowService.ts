
import { supabase } from "@/integrations/supabase/client";

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_number: number;
  step_name: string;
  role_required: string;
  status: 'pending' | 'approved' | 'rejected';
  assigned_to?: string;
  approved_by?: string;
  approved_at?: string;
  comments?: string;
}

export interface Workflow {
  id: string;
  organization_id: string;
  workflow_type: string;
  reference_type: string;
  reference_id: string;
  status: 'pending' | 'approved' | 'rejected';
  current_step: number;
  total_steps: number;
  amount?: number;
  metadata?: any;
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export const workflowService = {
  // Create a new workflow
  async createWorkflow(workflowData: {
    workflow_type: string;
    reference_type: string;
    reference_id: string;
    amount?: number;
    metadata?: any;
  }) {
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
          total_steps: 1, // Will be updated when steps are added
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

  // Add steps to a workflow
  async addWorkflowSteps(workflowId: string, steps: {
    step_name: string;
    role_required: string;
    assigned_to?: string;
  }[]) {
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

  // Get workflows for current user's organization
  async getWorkflows(filters?: {
    status?: string;
    workflow_type?: string;
    assigned_to_me?: boolean;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('workflows')
        .select(`
          *,
          workflow_steps (*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.workflow_type) {
        query = query.eq('workflow_type', filters.workflow_type);
      }

      if (filters?.assigned_to_me) {
        query = query.eq('assigned_to', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return { data: null, error };
    }
  },

  // Approve or reject a workflow step
  async processWorkflowStep(stepId: string, action: 'approve' | 'reject', comments?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const status = action === 'approve' ? 'approved' : 'rejected';

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
  },

  // Get pending workflows for current user
  async getPendingWorkflows() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const roles = userRoles?.map(ur => ur.role) || [];

      // Get workflows where current step requires user's role or is assigned to user
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          workflow_steps!inner (*)
        `)
        .eq('status', 'pending')
        .or(`assigned_to.eq.${user.id},workflow_steps.role_required.in.(${roles.join(',')})`);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching pending workflows:', error);
      return { data: null, error };
    }
  }
};
