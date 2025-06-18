
import { supabase } from '@/integrations/supabase/client';
import { Workflow, WorkflowInsert, WorkflowStep, WorkflowStepInsert } from './types';

export class WorkflowService {
  static async createWorkflow(workflow: Omit<WorkflowInsert, 'organization_id'>): Promise<Workflow> {
    // Get user's organization from their profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', workflow.created_by || '')
      .maybeSingle();

    if (!profile?.organization_id) {
      throw new Error('Cannot create workflow: No organization found for user');
    }

    const { data, error } = await supabase
      .from('workflows')
      .insert({
        ...workflow,
        organization_id: profile.organization_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createWorkflowStep(step: WorkflowStepInsert): Promise<WorkflowStep> {
    const { data, error } = await supabase
      .from('workflow_steps')
      .insert(step)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateWorkflowStep(
    stepId: string, 
    updates: { status?: string; approved_by?: string; comments?: string }
  ): Promise<WorkflowStep> {
    const updateData: any = { ...updates };
    if (updates.status === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('workflow_steps')
      .update(updateData)
      .eq('id', stepId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getWorkflowsByReference(referenceId: string, referenceType: string): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*, workflow_steps(*)')
      .eq('reference_id', referenceId)
      .eq('reference_type', referenceType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getPendingWorkflows(): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*, workflow_steps(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
