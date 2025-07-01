
import { supabase } from '@/integrations/supabase/client';

export interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

export abstract class BaseService {
  protected static async handleSupabaseResponse<T>(
    promise: Promise<{ data: T; error: any }>
  ): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await promise;
      
      if (error) {
        console.error('Supabase error:', error);
        return {
          data: null,
          error: new Error(error.message || 'Database operation failed')
        };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Service error:', err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred')
      };
    }
  }

  protected static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  protected static async getCurrentUserOrganization() {
    const user = await this.getCurrentUser();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile?.organization_id) {
      throw new Error('User organization not found');
    }

    return profile.organization_id;
  }
}
