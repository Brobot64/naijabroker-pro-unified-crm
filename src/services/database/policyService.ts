
import { supabase } from '@/integrations/supabase/client';
import { Policy, PolicyInsert, PolicyUpdate } from './types';
import { BaseService, ServiceResponse } from './baseService';

export class PolicyService extends BaseService {
  static async getAll(): Promise<Policy[]> {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching policies:', error);
      throw new Error('Failed to fetch policies');
    }
    
    return data || [];
  }

  static async getById(id: string): Promise<Policy | null> {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching policy:', error);
      throw new Error('Failed to fetch policy');
    }
    
    return data;
  }

  static async create(policy: PolicyInsert): Promise<Policy> {
    const { data, error } = await supabase
      .from('policies')
      .insert(policy)
      .select()
      .single();

    if (error) {
      console.error('Error creating policy:', error);
      throw new Error('Failed to create policy');
    }
    
    return data;
  }

  static async update(id: string, updates: PolicyUpdate): Promise<Policy> {
    const { data, error } = await supabase
      .from('policies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating policy:', error);
      throw new Error('Failed to update policy');
    }
    
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting policy:', error);
      throw new Error('Failed to delete policy');
    }
  }

  static async getExpiringPolicies(daysAhead = 30): Promise<Policy[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .lte('end_date', futureDate.toISOString().split('T')[0])
      .eq('status', 'active')
      .order('end_date', { ascending: true });

    if (error) {
      console.error('Error fetching expiring policies:', error);
      throw new Error('Failed to fetch expiring policies');
    }
    
    return data || [];
  }
}
