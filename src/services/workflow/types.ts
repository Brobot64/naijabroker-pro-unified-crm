
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
  workflow_steps?: WorkflowStep[];
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

export interface WorkflowFilters {
  status?: string;
  workflow_type?: string;
  assigned_to_me?: boolean;
}
