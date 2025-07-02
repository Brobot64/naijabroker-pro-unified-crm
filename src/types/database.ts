
// Enhanced type definitions for better type safety
export interface DatabaseQuote {
  id: string;
  quote_number: string;
  client_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  policy_type: string;
  sum_insured: number;
  premium: number;
  commission_rate: number;
  underwriter: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  workflow_stage: WorkflowStage | null;
  valid_until: string;
  organization_id: string;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  terms_conditions: string | null;
  notes: string | null;
  calculations: Record<string, any> | null;
  commission_splits: any[] | null;
  insurer_splits: any[] | null;
  rfq_document_url: string | null;
  interim_contract_url: string | null;
  final_contract_url: string | null;
  payment_status: string | null;
  payment_reference: string | null;
  converted_to_policy: string | null;
}

export interface DatabaseClient {
  id: string;
  name: string;
  client_code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contact_name: string | null;
  contact_address: string | null;
  industry: string | null;
  classification: string | null;
  source: string | null;
  account_officer: string | null;
  md: string | null;
  chairman: string | null;
  head_of_finance: string | null;
  birthday: string | null;
  anniversary: string | null;
  remark: string | null;
  organization_id: string;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
}

export type WorkflowStage = 
  | 'draft'
  | 'client-onboarding'
  | 'quote-drafting'
  | 'clause-recommendation'
  | 'rfq-generation'
  | 'insurer-matching'
  | 'quote-evaluation'
  | 'client-selection'
  | 'payment-processing'
  | 'contract-generation'
  | 'completed';

export interface QuoteCalculations {
  baseRate: number;
  riskFactor: number;
  discountApplied: number;
  finalPremium: number;
  commissionAmount: number;
  vatAmount: number;
  totalAmount: number;
  breakdown: {
    [key: string]: number;
  };
}

export interface InsurerSplit {
  insurerId: string;
  insurerName: string;
  percentage: number;
  premium: number;
  isLeadInsurer: boolean;
}

export interface CommissionSplit {
  recipientId: string;
  recipientName: string;
  recipientType: 'agent' | 'broker' | 'underwriter';
  percentage: number;
  amount: number;
}

// Validation schemas
export const validateQuoteData = (data: Partial<DatabaseQuote>): string[] => {
  const errors: string[] = [];

  if (!data.client_name?.trim()) {
    errors.push('Client name is required');
  }

  if (!data.policy_type?.trim()) {
    errors.push('Policy type is required');
  }

  if (!data.underwriter?.trim()) {
    errors.push('Underwriter is required');
  }

  if (typeof data.sum_insured !== 'number' || data.sum_insured <= 0) {
    errors.push('Sum insured must be a positive number');
  }

  if (typeof data.premium !== 'number' || data.premium <= 0) {
    errors.push('Premium must be a positive number');
  }

  if (typeof data.commission_rate !== 'number' || data.commission_rate < 0 || data.commission_rate > 100) {
    errors.push('Commission rate must be between 0 and 100');
  }

  if (data.valid_until) {
    const validUntil = new Date(data.valid_until);
    const today = new Date();
    if (validUntil <= today) {
      errors.push('Valid until date must be in the future');
    }
  }

  return errors;
};

export const validateClientData = (data: Partial<DatabaseClient>): string[] => {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Client name is required');
  }

  if (!data.client_code?.trim()) {
    errors.push('Client code is required');
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.push('Invalid phone number format');
  }

  return errors;
};
