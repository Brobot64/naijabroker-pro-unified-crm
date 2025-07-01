
// Core Entity Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organizationId: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: string;
  size?: string;
  industry?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  currency: string;
  businessHours: string;
  mfaRequired: boolean;
  passwordPolicy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Policy {
  id: string;
  organizationId: string;
  policyNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  underwriter: string;
  policyType: string;
  premium: number;
  sumInsured: number;
  commissionRate: number;
  commissionAmount: number;
  startDate: string;
  endDate: string;
  status: PolicyStatus;
  termsConditions?: string;
  notes?: string;
  coInsurers?: CoInsurer[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  organizationId: string;
  quoteNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  underwriter: string;
  policyType: string;
  premium: number;
  sumInsured: number;
  commissionRate: number;
  status: QuoteStatus;
  validUntil: string;
  termsConditions?: string;
  notes?: string;
  convertedToPolicyId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  organizationId: string;
  claimNumber: string;
  policyId: string;
  policyNumber: string;
  clientName: string;
  claimType: string;
  description?: string;
  incidentDate: string;
  reportedDate: string;
  estimatedLoss: number;
  settlementAmount?: number;
  status: ClaimStatus;
  assignedAdjuster?: string;
  investigationComplete: boolean;
  documentsComplete: boolean;
  underwriterApproval: boolean;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Workflow Types
export interface Workflow {
  id: string;
  organizationId: string;
  workflowType: string;
  referenceType: string;
  referenceId: string;
  currentStep: number;
  totalSteps: number;
  status: ApprovalStatus;
  amount?: number;
  assignedTo?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface WorkflowStep {
  id: string;
  workflowId: string;
  stepNumber: number;
  stepName: string;
  roleRequired: string;
  status: ApprovalStatus;
  assignedTo?: string;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  createdAt: string;
}

// Financial Types
export interface FinancialTransaction {
  id: string;
  organizationId: string;
  transactionNumber: string;
  transactionType: TransactionType;
  policyId?: string;
  claimId?: string;
  clientName: string;
  grossAmount: number;
  netAmount: number;
  vatAmount: number;
  outstandingAmount: number;
  paymentMethod?: PaymentMethod;
  status: string;
  dueDate?: string;
  chequeNumber?: string;
  chequeDate?: string;
  bankName?: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

// Activity & Notification Types
export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: string;
  user: string;
  organizationId: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  organizationId: string;
  notificationType: string;
  recipientEmail: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalPolicies: number;
  activePolicies: number;
  pendingClaims: number;
  totalPremium: number;
  claimsRatio: number;
  pendingRenewals: number;
  crossSellRate: number;
}

export interface AlertItem {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  client: string;
  message: string;
  status: string;
  assignedTo: string;
  createdAt: string;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  month: string;
  premium: number;
  claims: number;
}

// Enum Types
export type UserRole = 'SuperAdmin' | 'Admin' | 'Manager' | 'Agent' | 'Viewer';
export type PolicyStatus = 'draft' | 'active' | 'expired' | 'cancelled' | 'suspended';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type ClaimStatus = 'registered' | 'investigating' | 'processing' | 'approved' | 'settled' | 'rejected';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type TransactionType = 'premium' | 'claim_payment' | 'commission' | 'refund';
export type PaymentMethod = 'cash' | 'cheque' | 'bank_transfer' | 'card';

// Utility Types
export interface CoInsurer {
  name: string;
  percentage: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface PolicyFormData extends Omit<Policy, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> {}
export interface QuoteFormData extends Omit<Quote, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> {}
export interface ClaimFormData extends Omit<Claim, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> {}
