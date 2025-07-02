
import { supabase } from '@/integrations/supabase/client';

export interface Clause {
  id: string;
  name: string;
  description?: string;
  category: 'extension' | 'exclusion' | 'warranty' | 'deductible' | 'condition';
  policy_types: string[];
  clause_text: string;
  premium_impact_type: 'percentage' | 'fixed' | 'none';
  premium_impact_value: number;
  is_recommended: boolean;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface QuoteClause {
  id: string;
  quote_id: string;
  clause_id?: string;
  custom_name?: string;
  custom_description?: string;
  custom_clause_text?: string;
  category: string;
  premium_impact_type: string;
  premium_impact_value: number;
  is_custom: boolean;
  organization_id: string;
  created_at: string;
}

export class ClauseService {
  static async getAll(organizationId: string): Promise<Clause[]> {
    const { data, error } = await supabase
      .from('clauses')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async getByPolicyType(organizationId: string, policyType: string): Promise<Clause[]> {
    const { data, error } = await supabase
      .from('clauses')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .contains('policy_types', [policyType])
      .order('is_recommended', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async create(clause: Omit<Clause, 'id' | 'created_at' | 'updated_at'>): Promise<Clause> {
    const { data, error } = await supabase
      .from('clauses')
      .insert(clause)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<Clause>): Promise<Clause> {
    const { data, error } = await supabase
      .from('clauses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clauses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async addToQuote(quoteClause: Omit<QuoteClause, 'id' | 'created_at'>): Promise<QuoteClause> {
    const { data, error } = await supabase
      .from('quote_clauses')
      .insert(quoteClause)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getQuoteClauses(quoteId: string): Promise<QuoteClause[]> {
    const { data, error } = await supabase
      .from('quote_clauses')
      .select('*')
      .eq('quote_id', quoteId);

    if (error) throw error;
    return data || [];
  }

  static async removeFromQuote(id: string): Promise<void> {
    const { error } = await supabase
      .from('quote_clauses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
