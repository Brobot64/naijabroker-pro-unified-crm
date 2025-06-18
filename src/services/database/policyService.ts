
import { supabase } from '@/integrations/supabase/client';
import { Policy, PolicyInsert, PolicyUpdate } from './types';

export class PolicyService {
  static async getAll(): Promise<Policy[]> {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Policy | null> {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(policy: PolicyInsert): Promise<Policy> {
    const { data, error } = await supabase
      .from('policies')
      .insert(policy)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: PolicyUpdate): Promise<Policy> {
    const { data, error } = await supabase
      .from('policies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', id);

    if (error) throw error;
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

    if (error) throw error;
    return data || [];
  }
}
