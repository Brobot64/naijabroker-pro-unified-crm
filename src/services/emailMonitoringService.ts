import { supabase } from "@/integrations/supabase/client";

export interface EmailQuoteResponse {
  insurerName: string;
  premiumQuoted: number;
  termsConditions?: string;
  exclusions?: string[];
  coverageLimits?: Record<string, any>;
  documentUrl?: string;
  responseDate: string;
}

export class EmailMonitoringService {
  private static instance: EmailMonitoringService;
  private isMonitoring = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private organizationEmail: string | null = null;

  static getInstance(): EmailMonitoringService {
    if (!EmailMonitoringService.instance) {
      EmailMonitoringService.instance = new EmailMonitoringService();
    }
    return EmailMonitoringService.instance;
  }

  private async getOrganizationEmail(): Promise<string> {
    if (this.organizationEmail) {
      return this.organizationEmail;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error("User organization not found");
    }

    const { data: organization } = await supabase
      .from('organizations')
      .select('email')
      .eq('id', profile.organization_id)
      .single();

    if (!organization?.email) {
      throw new Error("Organization email not configured");
    }

    this.organizationEmail = organization.email;
    return this.organizationEmail;
  }

  async startMonitoring(quoteId: string, onQuoteReceived: (response: EmailQuoteResponse) => void) {
    if (this.isMonitoring) {
      console.log("Email monitoring already active");
      return;
    }

    try {
      const orgEmail = await this.getOrganizationEmail();
      this.isMonitoring = true;
      console.log(`Starting email monitoring for ${orgEmail}`);

      // Start real email monitoring via edge function
      const { error } = await supabase.functions.invoke('monitor-email-quotes', {
        body: {
          quoteId,
          email: orgEmail,
          action: 'start'
        }
      });

      if (error) {
        throw error;
      }

      // Poll for new responses every 10 minutes to minimize interruptions
      this.pollingInterval = setInterval(() => {
        this.checkForNewEmails(quoteId, onQuoteReceived);
      }, 600000);
    } catch (error) {
      console.error("Failed to start email monitoring:", error);
      this.isMonitoring = false;
      throw error;
    }
  }

  async stopMonitoring() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    if (this.isMonitoring && this.organizationEmail) {
      try {
        await supabase.functions.invoke('monitor-email-quotes', {
          body: {
            email: this.organizationEmail,
            action: 'stop'
          }
        });
      } catch (error) {
        console.error("Error stopping email monitoring:", error);
      }
    }

    this.isMonitoring = false;
    console.log("Email monitoring stopped");
  }

  private async checkForNewEmails(quoteId: string, onQuoteReceived: (response: EmailQuoteResponse) => void) {
    try {
      console.log("Checking for new quote emails...");
      
      // Check database for new insurer responses
      const { data: responses, error } = await supabase
        .from('insurer_responses')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error checking for new quotes:", error);
        return;
      }

      if (responses && responses.length > 0) {
        // Check if we have any new responses in the last 3 minutes
        const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
        const newResponses = responses.filter(response => 
          new Date(response.created_at || response.response_date) > threeMinutesAgo
        );

        for (const response of newResponses) {
          const emailResponse: EmailQuoteResponse = {
            insurerName: response.insurer_name,
            premiumQuoted: response.premium_quoted,
            termsConditions: response.terms_conditions,
            exclusions: response.exclusions || [],
            coverageLimits: (response.coverage_limits as Record<string, any>) || {},
            documentUrl: response.document_url,
            responseDate: response.response_date || response.created_at
          };

          onQuoteReceived(emailResponse);
        }
      }

      // Also check via edge function for real-time email processing
      if (this.organizationEmail) {
        const { data, error: functionError } = await supabase.functions.invoke('check-email-quotes', {
          body: {
            quoteId,
            email: this.organizationEmail,
            lastCheck: new Date(Date.now() - 2 * 60 * 1000).toISOString()
          }
        });

        if (!functionError && data?.newQuotes) {
          for (const quote of data.newQuotes) {
            onQuoteReceived(quote);
          }
        }
      }
    } catch (error) {
      console.error("Error checking emails:", error);
    }
  }

  async saveInsurerResponse(quoteId: string, organizationId: string, response: EmailQuoteResponse) {
    try {
      const { data, error } = await supabase
        .from('insurer_responses')
        .insert({
          quote_id: quoteId,
          organization_id: organizationId,
          insurer_name: response.insurerName,
          premium_quoted: response.premiumQuoted,
          terms_conditions: response.termsConditions,
          exclusions: response.exclusions,
          coverage_limits: response.coverageLimits,
          document_url: response.documentUrl,
          response_date: response.responseDate
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving insurer response:", error);
      throw error;
    }
  }

  async getMonitoringEmail(): Promise<string> {
    return await this.getOrganizationEmail();
  }

  isCurrentlyMonitoring(): boolean {
    return this.isMonitoring;
  }
}

export const emailMonitoringService = EmailMonitoringService.getInstance();