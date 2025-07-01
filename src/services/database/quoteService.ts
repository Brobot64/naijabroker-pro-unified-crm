
import { supabase } from '@/integrations/supabase/client';
import { Quote, QuoteInsert, QuoteUpdate } from './types';

export interface QuoteWithClient extends Quote {
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export class QuoteService {
  static async getAll(): Promise<QuoteWithClient[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        client:clients(id, name, email, phone)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<QuoteWithClient | null> {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        client:clients(id, name, email, phone)
      `)
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

  static async updateWorkflowStage(id: string, stage: string): Promise<Quote> {
    return this.update(id, { workflow_stage: stage });
  }

  static async convertToPolicy(id: string, policyId: string): Promise<Quote> {
    return this.update(id, { 
      status: 'accepted',
      converted_to_policy: policyId,
      workflow_stage: 'converted'
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

  static async getByWorkflowStage(stage: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('workflow_stage', stage)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
