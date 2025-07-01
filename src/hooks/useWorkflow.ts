
import { useState, useEffect } from 'react';
import { workflowService, Workflow, CreateWorkflowData } from '@/services/workflowService';
import { useToast } from '@/hooks/use-toast';

export const useWorkflow = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [pendingWorkflows, setPendingWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadWorkflows = async (filters?: any) => {
    setLoading(true);
    try {
      const { data, error } = await workflowService.getWorkflows(filters);
      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPendingWorkflows = async () => {
    try {
      const { data, error } = await workflowService.getPendingWorkflows();
      if (error) throw error;
      setPendingWorkflows(data || []);
    } catch (error) {
      console.error('Error loading pending workflows:', error);
    }
  };

  const createWorkflow = async (workflowData: CreateWorkflowData) => {
    try {
      const { data, error } = await workflowService.createWorkflow(workflowData);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Workflow created successfully",
      });
      
      loadWorkflows();
      return { data, error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const processWorkflowStep = async (stepId: string, action: 'approve' | 'reject', comments?: string) => {
    try {
      const { data, error } = await workflowService.processWorkflowStep(stepId, action, comments);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Workflow step ${action}d successfully`,
      });
      
      loadWorkflows();
      loadPendingWorkflows();
      return { data, error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} workflow step`,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    loadWorkflows();
    loadPendingWorkflows();
  }, []);

  return {
    workflows,
    pendingWorkflows,
    loading,
    loadWorkflows,
    loadPendingWorkflows,
    createWorkflow,
    processWorkflowStep,
  };
};
