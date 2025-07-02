
import { supabase } from "@/integrations/supabase/client";

interface AuditLogEntry {
  action: string;
  stage: string;
  quote_id: string;
  organization_id: string;
  user_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
}

export const logQuoteAction = async (entry: AuditLogEntry) => {
  try {
    // Get client IP and user agent (in a real app, this would come from request headers)
    const clientInfo = {
      ip_address: entry.ip_address || 'unknown',
      user_agent: entry.user_agent || navigator.userAgent.slice(0, 255) // Truncate to avoid DB limits
    };

    const { error } = await supabase
      .from('quote_audit_trail')
      .insert({
        ...entry,
        ...clientInfo,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging audit entry:', error);
    }
  } catch (error) {
    console.error('Failed to log audit entry:', error);
  }
};

export const logWorkflowStage = async (
  quoteId: string,
  organizationId: string,
  stage: string,
  action: string,
  details?: any,
  userId?: string
) => {
  await logQuoteAction({
    action,
    stage,
    quote_id: quoteId,
    organization_id: organizationId,
    user_id: userId,
    details
  });
};
