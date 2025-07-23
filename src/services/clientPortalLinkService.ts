import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ClientPortalLink = Database['public']['Tables']['client_portal_links']['Row'];

/**
 * Service for managing client portal links automatically
 */
export class ClientPortalLinkService {
  /**
   * Automatically create client portal link when quote reaches client-selection stage
   */
  static async ensureClientPortalLink(quoteId: string): Promise<ClientPortalLink | null> {
    try {
      console.log('🔗 ClientPortalLinkService: Ensuring portal link for quote:', quoteId);

      // Check if link already exists
      const { data: existingLink } = await supabase
        .from('client_portal_links')
        .select('*')
        .eq('quote_id', quoteId)
        .eq('is_used', false)
        .maybeSingle();

      if (existingLink) {
        console.log('✅ Client portal link already exists:', existingLink.id);
        return existingLink;
      }

      // Get quote details
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('id, organization_id, client_id, quote_number')
        .eq('id', quoteId)
        .maybeSingle();

      if (quoteError || !quote) {
        console.error('❌ Failed to fetch quote for portal link:', quoteError);
        return null;
      }

      // Get evaluated quotes for this quote
      const { data: evaluatedQuotes, error: evalError } = await supabase
        .from('evaluated_quotes')
        .select('*')
        .eq('quote_id', quoteId)
        .eq('response_received', true);

      if (evalError) {
        console.error('❌ Failed to fetch evaluated quotes:', evalError);
        return null;
      }

      // Generate secure token
      const token = `${quote.quote_number}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create client portal link
      const { data: newLink, error: createError } = await supabase
        .from('client_portal_links')
        .insert({
          organization_id: quote.organization_id,
          quote_id: quote.id,
          client_id: quote.client_id,
          token: token,
          expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours
          is_used: false,
          evaluated_quotes_data: evaluatedQuotes || []
        })
        .select()
        .maybeSingle();

      if (createError) {
        console.error('❌ Failed to create client portal link:', createError);
        return null;
      }

      console.log('✅ Client portal link created successfully:', newLink?.id);
      return newLink;
    } catch (error) {
      console.error('❌ ClientPortalLinkService: Error ensuring portal link:', error);
      return null;
    }
  }

  /**
   * Get client portal link by quote ID
   */
  static async getByQuoteId(quoteId: string): Promise<ClientPortalLink | null> {
    try {
      const { data, error } = await supabase
        .from('client_portal_links')
        .select('*')
        .eq('quote_id', quoteId)
        .eq('is_used', false)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching client portal link:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ ClientPortalLinkService: Error getting portal link:', error);
      return null;
    }
  }

  /**
   * Mark client portal link as used
   */
  static async markAsUsed(linkId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('client_portal_links')
        .update({ is_used: true })
        .eq('id', linkId);

      if (error) {
        console.error('❌ Error marking portal link as used:', error);
        return false;
      }

      console.log('✅ Client portal link marked as used:', linkId);
      return true;
    } catch (error) {
      console.error('❌ ClientPortalLinkService: Error marking link as used:', error);
      return false;
    }
  }

  /**
   * Generate payment link URL for client portal
   */
  static generatePaymentUrl(token: string, baseUrl?: string): string {
    const base = baseUrl || window.location.origin;
    return `${base}/payment?token=${token}`;
  }
}