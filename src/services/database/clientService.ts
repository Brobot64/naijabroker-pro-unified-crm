
import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  organization_id: string;
  client_code: string;
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
  birthday?: string;
  anniversary?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ClientInsert {
  organization_id: string;
  client_code: string;
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
  birthday?: string;
  anniversary?: string;
  created_by?: string;
}

export class ClientService {
  static async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(client: Omit<ClientInsert, 'client_code'>): Promise<Client> {
    // Generate client code
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_client_code', { org_id: client.organization_id });

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
    return data;
  }

  static async update(id: string, updates: Partial<ClientInsert>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async searchByName(name: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .ilike('name', `%${name}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async getByEmail(email: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
