
import { supabase } from '@/integrations/supabase/client';
import { Quote, QuoteInsert, QuoteUpdate } from './types';

export class QuoteService {
  static async getAll(): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Quote | null> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(quote: QuoteInsert): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .insert(quote)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: QuoteUpdate): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateStatus(id: string, status: string): Promise<Quote> {
    return this.update(id, { status: status as any });
  }

  static async convertToPolicy(id: string, policyId: string): Promise<Quote> {
    return this.update(id, { 
      status: 'accepted',
      converted_to_policy: policyId
    });
  }

  static async getExpiringQuotes(daysAhead = 7): Promise<Quote[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .lte('valid_until', futureDate.toISOString().split('T')[0])
      .eq('status', 'sent')
      .order('valid_until', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
