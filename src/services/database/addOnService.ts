import { supabase } from '@/integrations/supabase/client';

export interface AddOn {
  id: string;
  name: string;
  description?: string;
  category: string;
  policy_types: string[];
  coverage_details?: string;
  premium_impact_type: 'percentage' | 'fixed' | 'none';
  premium_impact_value: number;
  sum_insured_impact: number;
  is_recommended: boolean;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface QuoteAddOn {
  id: string;
  quote_id: string;
  add_on_id?: string;
  custom_name?: string;
  custom_description?: string;
  custom_coverage_details?: string;
  premium_impact_type: string;
  premium_impact_value: number;
  sum_insured_impact: number;
  is_custom: boolean;
  organization_id: string;
  created_at: string;
}

export class AddOnService {
  static async getAll(organizationId: string): Promise<AddOn[]> {
    const { data, error } = await supabase
      .from('add_ons')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      premium_impact_type: item.premium_impact_type as 'percentage' | 'fixed' | 'none'
    }));
  }

  static async getByPolicyType(organizationId: string, policyType: string): Promise<AddOn[]> {
    const { data, error } = await supabase
      .from('add_ons')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .contains('policy_types', [policyType])
      .order('is_recommended', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      premium_impact_type: item.premium_impact_type as 'percentage' | 'fixed' | 'none'
    }));
  }

  static async create(addOn: Omit<AddOn, 'id' | 'created_at' | 'updated_at'>): Promise<AddOn> {
    const { data, error } = await supabase
      .from('add_ons')
      .insert(addOn)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      premium_impact_type: data.premium_impact_type as 'percentage' | 'fixed' | 'none'
    };
  }

  static async update(id: string, updates: Partial<AddOn>): Promise<AddOn> {
    const { data, error } = await supabase
      .from('add_ons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      premium_impact_type: data.premium_impact_type as 'percentage' | 'fixed' | 'none'
    };
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('add_ons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async addToQuote(quoteAddOn: Omit<QuoteAddOn, 'id' | 'created_at'>): Promise<QuoteAddOn> {
    const { data, error } = await supabase
      .from('quote_add_ons')
      .insert(quoteAddOn)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getQuoteAddOns(quoteId: string): Promise<QuoteAddOn[]> {
    const { data, error } = await supabase
      .from('quote_add_ons')
      .select('*')
      .eq('quote_id', quoteId);

    if (error) throw error;
    return data || [];
  }

  static async removeFromQuote(id: string): Promise<void> {
    const { error } = await supabase
      .from('quote_add_ons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
