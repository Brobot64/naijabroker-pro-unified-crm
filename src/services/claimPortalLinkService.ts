import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ClaimPortalLink = {
  id: string;
  organization_id: string;
  claim_id: string;
  client_id: string;
  token: string;
  expires_at: string;
  is_used: boolean;
  created_at: string;
  claim_data: any;
};

/**
 * Service for managing claim portal links
 */
export class ClaimPortalLinkService {
  /**
   * Generate client portal link for claim registration
   */
  static async generateClaimPortalLink(
    claimId: string,
    clientId: string,
    claimData: any
  ): Promise<{ data: { portalUrl: string; portalLinkId: string; expiresAt: string } | null; error: any }> {
    try {
      console.log('🔗 Generating claim portal link for:', { claimId, clientId });

      // Get current user's organization
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession.session?.user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userSession.session.user.id)
        .single();

      if (!profile?.organization_id) {
        return { data: null, error: { message: 'User organization not found' } };
      }

      // Call the edge function to generate portal link
      const { data, error } = await supabase.functions.invoke('generate-claim-portal-link', {
        body: {
          claimId,
          clientId,
          claimData,
          expiryHours: 72
        }
      });

      if (error) {
        console.error('❌ Error from edge function:', error);
        return { data: null, error };
      }

      console.log('✅ Claim portal link generated successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ ClaimPortalLinkService: Error generating portal link:', error);
      return { data: null, error };
    }
  }

  /**
   * Send email notification for claim portal link
   */
  static async sendEmailNotification(
    type: string,
    recipientEmail: string,
    subject: string,
    message: string,
    metadata: any = {}
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          type,
          recipientEmail,
          subject,
          message,
          metadata
        }
      });

      if (error) {
        console.error('❌ Error sending email notification:', error);
        return { data: null, error };
      }

      console.log('✅ Email notification sent successfully');
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error in sendEmailNotification:', error);
      return { data: null, error };
    }
  }

  /**
   * Get claim portal link by claim ID
   */
  static async getByClaimId(claimId: string): Promise<ClaimPortalLink | null> {
    try {
      const { data, error } = await supabase
        .from('claim_portal_links')
        .select('*')
        .eq('claim_id', claimId)
        .eq('is_used', false)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching claim portal link:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ ClaimPortalLinkService: Error getting portal link:', error);
      return null;
    }
  }

  /**
   * Generate payment link URL for claim portal
   */
  static generateClaimPortalUrl(token: string, baseUrl?: string): string {
    const base = baseUrl || window.location.origin;
    return `${base}/claim-portal?token=${token}`;
  }
}