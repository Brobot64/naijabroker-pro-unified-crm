
import { supabase } from '@/integrations/supabase/client';
import { Claim, ClaimInsert, ClaimUpdate } from './types';

export class ClaimService {
  static async getAll(): Promise<Claim[]> {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Claim | null> {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(claim: ClaimInsert): Promise<Claim> {
    const { data, error } = await supabase
      .from('claims')
      .insert(claim)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: ClaimUpdate): Promise<Claim> {
    const { data, error } = await supabase
      .from('claims')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateStatus(id: string, status: string): Promise<Claim> {
    return this.update(id, { status: status as any });
  }

  static async assignAdjuster(id: string, adjusterId: string): Promise<Claim> {
    return this.update(id, { assigned_adjuster: adjusterId });
  }

  static async getByPolicyId(policyId: string): Promise<Claim[]> {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('policy_id', policyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
