
import { supabase } from "@/integrations/supabase/client";
import { WorkflowFilters } from "./types";

export const workflowQueries = {
  // Get workflows for current user's organization
  async getWorkflows(filters?: WorkflowFilters) {
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
        query = query.eq('status', filters.status as 'pending' | 'approved' | 'rejected');
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
