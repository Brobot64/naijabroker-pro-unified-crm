import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MONITORING_EMAIL = "nbcgrandelite3@gmail.com";

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

  static getInstance(): EmailMonitoringService {
    if (!EmailMonitoringService.instance) {
      EmailMonitoringService.instance = new EmailMonitoringService();
    }
    return EmailMonitoringService.instance;
  }

  startMonitoring(quoteId: string, onQuoteReceived: (response: EmailQuoteResponse) => void) {
    if (this.isMonitoring) {
      console.log("Email monitoring already active");
      return;
    }

    this.isMonitoring = true;
    console.log(`Starting email monitoring for ${MONITORING_EMAIL}`);

    // In a real implementation, this would connect to email API (Gmail, Outlook, etc.)
    // For now, we'll simulate email checking every 30 seconds
    this.pollingInterval = setInterval(() => {
      this.checkForNewEmails(quoteId, onQuoteReceived);
    }, 30000);
  }

  stopMonitoring() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isMonitoring = false;
    console.log("Email monitoring stopped");
  }

  private async checkForNewEmails(quoteId: string, onQuoteReceived: (response: EmailQuoteResponse) => void) {
    try {
      // In a real implementation, this would:
      // 1. Connect to email provider API (Gmail, Outlook, etc.)
      // 2. Check for new emails with PDF attachments
      // 3. Parse email content and extract quote information
      // 4. Download and process PDF attachments
      // 5. Extract structured data from PDFs using OCR or AI

      console.log("Checking for new quote emails...");
      
      // Simulate finding new emails (for testing purposes)
      const simulateEmailReceived = Math.random() < 0.1; // 10% chance every check
      
      if (simulateEmailReceived) {
        const mockResponse: EmailQuoteResponse = {
          insurerName: "Test Insurer",
          premiumQuoted: Math.floor(Math.random() * 500000) + 1000000,
          termsConditions: "Standard terms and conditions with competitive coverage",
          exclusions: ["War risks", "Nuclear risks"],
          coverageLimits: {
            "Property Damage": "50,000,000",
            "Third Party Liability": "100,000,000"
          },
          documentUrl: "mock-pdf-url",
          responseDate: new Date().toISOString()
        };

        onQuoteReceived(mockResponse);
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

  getMonitoringEmail(): string {
    return MONITORING_EMAIL;
  }

  isCurrentlyMonitoring(): boolean {
    return this.isMonitoring;
  }
}

export const emailMonitoringService = EmailMonitoringService.getInstance();