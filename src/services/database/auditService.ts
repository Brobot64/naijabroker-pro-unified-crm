
import { supabase } from '@/integrations/supabase/client';
import { AuditLog, AuditLogInsert } from './types';

export class AuditService {
  static async log(logEntry: Omit<AuditLogInsert, 'organization_id'>): Promise<void> {
    // Get user's organization from their profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', logEntry.user_id || '')
      .maybeSingle();

    if (!profile?.organization_id) {
      console.warn('Cannot create audit log: No organization found for user');
      return;
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        ...logEntry,
        organization_id: profile.organization_id
      });

    if (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  static async getLogs(limit = 100): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getLogsByResourceType(resourceType: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_type', resourceType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getLogsByUser(userId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
