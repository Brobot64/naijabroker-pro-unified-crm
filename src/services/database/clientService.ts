
import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  organization_id: string;
  client_code: string;
  client_type: 'company' | 'individual';
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  source?: string;
  industry?: string;
  classification?: string;
  remark?: string;
  account_officer?: string;
  chairman?: string;
  md?: string;
  head_of_finance?: string;
  contact_name?: string;
  contact_address?: string;
  contact_phone?: string;
  contact_email?: string;
  birthday?: string;
  anniversary?: string;
  contact_birthday?: string;
  contact_anniversary?: string;
  chairman_phone?: string;
  chairman_email?: string;
  chairman_birthday?: string;
  md_phone?: string;
  md_email?: string;
  md_birthday?: string;
  head_of_finance_phone?: string;
  head_of_finance_email?: string;
  head_of_finance_birthday?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ClientInsert {
  organization_id: string;
  client_code: string;
  client_type: 'company' | 'individual';
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  source?: string;
  industry?: string;
  classification?: string;
  remark?: string;
  account_officer?: string;
  chairman?: string;
  md?: string;
  head_of_finance?: string;
  contact_name?: string;
  contact_address?: string;
  contact_phone?: string;
  contact_email?: string;
  birthday?: string;
  anniversary?: string;
  contact_birthday?: string;
  contact_anniversary?: string;
  chairman_phone?: string;
  chairman_email?: string;
  chairman_birthday?: string;
  md_phone?: string;
  md_email?: string;
  md_birthday?: string;
  head_of_finance_phone?: string;
  head_of_finance_email?: string;
  head_of_finance_birthday?: string;
  created_by?: string;
}

export class ClientService {
  static async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(client => ({
      ...client,
      client_type: (client.client_type as 'company' | 'individual') || 'company'
    }));
  }

  static async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? {
      ...data,
      client_type: (data.client_type as 'company' | 'individual') || 'company'
    } : null;
  }

  static async create(client: Omit<ClientInsert, 'client_code'>): Promise<Client> {
    // Generate client code with type support
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_client_code', { 
        org_id: client.organization_id,
        client_type: client.client_type || 'company'
      });

    if (codeError) throw codeError;

    const clientData: ClientInsert = {
      ...client,
      client_code: codeData
    };

    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      client_type: (data.client_type as 'company' | 'individual') || 'company'
    };
  }

  static async update(id: string, updates: Partial<ClientInsert>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      client_type: (data.client_type as 'company' | 'individual') || 'company'
    };
  }

  static async searchByName(name: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .ilike('name', `%${name}%`)
      .order('name');

    if (error) throw error;
    return (data || []).map(client => ({
      ...client,
      client_type: (client.client_type as 'company' | 'individual') || 'company'
    }));
  }

  static async getByEmail(email: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data ? {
      ...data,
      client_type: (data.client_type as 'company' | 'individual') || 'company'
    } : null;
  }
}
