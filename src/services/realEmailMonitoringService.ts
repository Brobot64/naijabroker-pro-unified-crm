import { supabase } from "@/integrations/supabase/client";

export interface EmailQuoteResponse {
  insurerName: string;
  premiumQuoted: number;
  termsConditions?: string;
  exclusions?: string[];
  coverageLimits?: Record<string, any>;
  documentUrl?: string;
  responseDate: string;
  emailSubject?: string;
  emailBody?: string;
}

export interface EmailMonitoringConfig {
  email: string;
  provider: 'gmail' | 'outlook' | 'imap';
  imapHost?: string;
  imapPort?: number;
  username?: string;
  password?: string;
}

export class RealEmailMonitoringService {
  private static instance: RealEmailMonitoringService;
  private isMonitoring = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private config: EmailMonitoringConfig;

  constructor() {
    this.config = {
      email: "",
      provider: 'gmail'
    };
  }

  private async getOrganizationEmail(): Promise<string> {
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

    return organization.email;
  }

  static getInstance(): RealEmailMonitoringService {
    if (!RealEmailMonitoringService.instance) {
      RealEmailMonitoringService.instance = new RealEmailMonitoringService();
    }
    return RealEmailMonitoringService.instance;
  }

  async startMonitoring(quoteId: string, onQuoteReceived: (response: EmailQuoteResponse) => void) {
    if (this.isMonitoring) {
      console.log("Email monitoring already active");
      return;
    }

    try {
      const orgEmail = await this.getOrganizationEmail();
      this.config.email = orgEmail;
      this.isMonitoring = true;
      console.log(`Starting real email monitoring for ${orgEmail}`);

      // Start the email monitoring service via edge function
      const { data, error } = await supabase.functions.invoke('monitor-email-quotes', {
        body: {
          quoteId,
          email: orgEmail,
          provider: this.config.provider,
          action: 'start'
        }
      });

      if (error) {
        throw error;
      }

      // Poll for new responses every 5 minutes to reduce interruptions
      this.pollingInterval = setInterval(async () => {
        await this.checkForNewQuotes(quoteId, onQuoteReceived);
      }, 300000); // 5 minutes

      console.log("Email monitoring started successfully");
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

    if (this.isMonitoring) {
      try {
        // Stop the email monitoring service
        await supabase.functions.invoke('monitor-email-quotes', {
          body: {
            email: this.config.email,
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

  private async checkForNewQuotes(quoteId: string, onQuoteReceived: (response: EmailQuoteResponse) => void) {
    try {
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
        // Check if we have any new responses in the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const newResponses = responses.filter(response => 
          new Date(response.created_at) > fiveMinutesAgo
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
      const { data, error: functionError } = await supabase.functions.invoke('check-email-quotes', {
        body: {
          quoteId,
          email: this.config.email,
          lastCheck: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        }
      });

      if (!functionError && data?.newQuotes) {
        for (const quote of data.newQuotes) {
          onQuoteReceived(quote);
        }
      }

    } catch (error) {
      console.error("Error checking for new emails:", error);
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
        })
        .select()
        .single();

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

  updateConfig(config: Partial<EmailMonitoringConfig>) {
    this.config = { ...this.config, ...config };
  }
}

export const realEmailMonitoringService = RealEmailMonitoringService.getInstance();