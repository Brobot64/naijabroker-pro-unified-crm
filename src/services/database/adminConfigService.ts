import { supabase } from '@/integrations/supabase/client';

export interface AdminConfigOption {
  id: string;
  organization_id: string;
  value: string;
  label: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminConfigInsert {
  organization_id: string;
  value: string;
  label: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface AccountOfficer {
  id: string;
  organization_id: string;
  name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountOfficerInsert {
  organization_id: string;
  name: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}

export class AdminConfigService {
  // Classifications
  static async getClassifications(): Promise<AdminConfigOption[]> {
    const { data, error } = await supabase
      .from('client_classifications')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }

  static async createClassification(classification: AdminConfigInsert): Promise<AdminConfigOption> {
    const { data, error } = await supabase
      .from('client_classifications')
      .insert(classification)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateClassification(id: string, updates: Partial<AdminConfigInsert>): Promise<AdminConfigOption> {
    const { data, error } = await supabase
      .from('client_classifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteClassification(id: string): Promise<void> {
    const { error } = await supabase
      .from('client_classifications')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // Industries
  static async getIndustries(): Promise<AdminConfigOption[]> {
    const { data, error } = await supabase
      .from('client_industries')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }

  static async createIndustry(industry: AdminConfigInsert): Promise<AdminConfigOption> {
    const { data, error } = await supabase
      .from('client_industries')
      .insert(industry)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateIndustry(id: string, updates: Partial<AdminConfigInsert>): Promise<AdminConfigOption> {
    const { data, error } = await supabase
      .from('client_industries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteIndustry(id: string): Promise<void> {
    const { error } = await supabase
      .from('client_industries')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // Sources
  static async getSources(): Promise<AdminConfigOption[]> {
    const { data, error } = await supabase
      .from('client_sources')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }

  static async createSource(source: AdminConfigInsert): Promise<AdminConfigOption> {
    const { data, error } = await supabase
      .from('client_sources')
      .insert(source)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSource(id: string, updates: Partial<AdminConfigInsert>): Promise<AdminConfigOption> {
    const { data, error } = await supabase
      .from('client_sources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteSource(id: string): Promise<void> {
    const { error } = await supabase
      .from('client_sources')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // Account Officers
  static async getAccountOfficers(): Promise<AccountOfficer[]> {
    const { data, error } = await supabase
      .from('account_officers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async createAccountOfficer(officer: AccountOfficerInsert): Promise<AccountOfficer> {
    const { data, error } = await supabase
      .from('account_officers')
      .insert(officer)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateAccountOfficer(id: string, updates: Partial<AccountOfficerInsert>): Promise<AccountOfficer> {
    const { data, error } = await supabase
      .from('account_officers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteAccountOfficer(id: string): Promise<void> {
    const { error } = await supabase
      .from('account_officers')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }
}