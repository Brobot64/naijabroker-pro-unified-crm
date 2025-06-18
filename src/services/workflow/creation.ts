
import { supabase } from "@/integrations/supabase/client";
import { CreateWorkflowData, WorkflowStepData } from "./types";

export const workflowCreation = {
  // Create a new workflow
  async createWorkflow(workflowData: CreateWorkflowData) {
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
  async addWorkflowSteps(workflowId: string, steps: WorkflowStepData[]) {
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
  }
};
