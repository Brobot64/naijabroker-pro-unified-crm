
import { supabase } from "@/integrations/supabase/client";

export const workflowOperations = {
  // Approve or reject a workflow step
  async processWorkflowStep(stepId: string, action: 'approve' | 'reject', comments?: string) {
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
