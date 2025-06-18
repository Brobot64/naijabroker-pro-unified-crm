
import { Database } from '@/integrations/supabase/types';

// Core database types from our schema
export type Policy = Database['public']['Tables']['policies']['Row'];
export type PolicyInsert = Database['public']['Tables']['policies']['Insert'];
export type PolicyUpdate = Database['public']['Tables']['policies']['Update'];

export type Quote = Database['public']['Tables']['quotes']['Row'];
export type QuoteInsert = Database['public']['Tables']['quotes']['Insert'];
export type QuoteUpdate = Database['public']['Tables']['quotes']['Update'];

export type Claim = Database['public']['Tables']['claims']['Row'];
export type ClaimInsert = Database['public']['Tables']['claims']['Insert'];
export type ClaimUpdate = Database['public']['Tables']['claims']['Update'];

export type FinancialTransaction = Database['public']['Tables']['financial_transactions']['Row'];
export type FinancialTransactionInsert = Database['public']['Tables']['financial_transactions']['Insert'];
export type FinancialTransactionUpdate = Database['public']['Tables']['financial_transactions']['Update'];

export type SettlementVoucher = Database['public']['Tables']['settlement_vouchers']['Row'];
export type SettlementVoucherInsert = Database['public']['Tables']['settlement_vouchers']['Insert'];
export type SettlementVoucherUpdate = Database['public']['Tables']['settlement_vouchers']['Update'];

export type DischargeVoucher = Database['public']['Tables']['discharge_vouchers']['Row'];
export type DischargeVoucherInsert = Database['public']['Tables']['discharge_vouchers']['Insert'];
export type DischargeVoucherUpdate = Database['public']['Tables']['discharge_vouchers']['Update'];

export type Workflow = Database['public']['Tables']['workflows']['Row'];
export type WorkflowInsert = Database['public']['Tables']['workflows']['Insert'];
export type WorkflowUpdate = Database['public']['Tables']['workflows']['Update'];

export type WorkflowStep = Database['public']['Tables']['workflow_steps']['Row'];
export type WorkflowStepInsert = Database['public']['Tables']['workflow_steps']['Insert'];
export type WorkflowStepUpdate = Database['public']['Tables']['workflow_steps']['Update'];

export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];

export type NotificationRecord = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

// Enums
export type PolicyStatus = Database['public']['Enums']['policy_status'];
export type ClaimStatus = Database['public']['Enums']['claim_status'];
export type QuoteStatus = Database['public']['Enums']['quote_status'];
export type TransactionType = Database['public']['Enums']['transaction_type'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type SettlementType = Database['public']['Enums']['settlement_type'];
export type ApprovalStatus = Database['public']['Enums']['approval_status'];
