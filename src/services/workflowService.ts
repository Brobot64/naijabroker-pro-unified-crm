
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

export const workflowService = {
  async getWorkflows(): Promise<{ data: Workflow[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

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

  async processWorkflowStep(stepId: string, action: 'approve' | 'reject', comments?: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('workflow_steps')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          comments,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', stepId);

      return { error };
    } catch (error) {
      return { error };
    }
  }
};
