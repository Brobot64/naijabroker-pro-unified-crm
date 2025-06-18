
-- Create enum types for various status fields
CREATE TYPE policy_status AS ENUM ('draft', 'active', 'expired', 'cancelled', 'renewed');
CREATE TYPE claim_status AS ENUM ('registered', 'investigating', 'assessed', 'approved', 'settled', 'rejected', 'closed');
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
CREATE TYPE transaction_type AS ENUM ('debit_note', 'credit_note', 'receipt', 'remittance', 'commission');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'cheque', 'cash', 'online', 'card');
CREATE TYPE settlement_type AS ENUM ('full', 'partial', 'final');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Policies table
CREATE TABLE public.policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    policy_number TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    underwriter TEXT NOT NULL,
    policy_type TEXT NOT NULL,
    sum_insured DECIMAL(15,2) NOT NULL DEFAULT 0,
    premium DECIMAL(15,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    commission_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    status policy_status NOT NULL DEFAULT 'draft',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    co_insurers JSONB DEFAULT '[]',
    terms_conditions TEXT,
    notes TEXT
);

-- Quotes table
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    quote_number TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    underwriter TEXT NOT NULL,
    policy_type TEXT NOT NULL,
    sum_insured DECIMAL(15,2) NOT NULL DEFAULT 0,
    premium DECIMAL(15,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    status quote_status NOT NULL DEFAULT 'draft',
    valid_until DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    terms_conditions TEXT,
    notes TEXT,
    converted_to_policy UUID REFERENCES public.policies(id)
);

-- Claims table
CREATE TABLE public.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    claim_number TEXT UNIQUE NOT NULL,
    policy_id UUID REFERENCES public.policies(id) ON DELETE CASCADE NOT NULL,
    policy_number TEXT NOT NULL,
    client_name TEXT NOT NULL,
    claim_type TEXT NOT NULL,
    incident_date DATE NOT NULL,
    reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
    estimated_loss DECIMAL(15,2) NOT NULL DEFAULT 0,
    settlement_amount DECIMAL(15,2) DEFAULT 0,
    status claim_status NOT NULL DEFAULT 'registered',
    assigned_adjuster UUID REFERENCES auth.users(id),
    investigation_complete BOOLEAN DEFAULT false,
    documents_complete BOOLEAN DEFAULT false,
    underwriter_approval BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    description TEXT,
    notes TEXT
);

-- Financial transactions table (unified for all financial operations)
CREATE TABLE public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    transaction_number TEXT UNIQUE NOT NULL,
    transaction_type transaction_type NOT NULL,
    policy_id UUID REFERENCES public.policies(id),
    claim_id UUID REFERENCES public.claims(id),
    client_name TEXT NOT NULL,
    gross_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    outstanding_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_method payment_method,
    cheque_number TEXT,
    cheque_date DATE,
    bank_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Settlement vouchers table
CREATE TABLE public.settlement_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    voucher_number TEXT UNIQUE NOT NULL,
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE NOT NULL,
    policy_number TEXT NOT NULL,
    client_name TEXT NOT NULL,
    agreed_amount DECIMAL(15,2) NOT NULL,
    settlement_type settlement_type NOT NULL DEFAULT 'full',
    cheque_number TEXT NOT NULL,
    cheque_date DATE NOT NULL,
    bank_name TEXT,
    discharging_officer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    remarks TEXT,
    is_processed BOOLEAN DEFAULT false
);

-- Discharge vouchers table  
CREATE TABLE public.discharge_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    voucher_number TEXT UNIQUE NOT NULL,
    settlement_voucher_id UUID REFERENCES public.settlement_vouchers(id) ON DELETE CASCADE NOT NULL,
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE NOT NULL,
    underwriter TEXT NOT NULL,
    voucher_amount DECIMAL(15,2) NOT NULL,
    discharge_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Workflows table for approval processes
CREATE TABLE public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    workflow_type TEXT NOT NULL,
    reference_id UUID NOT NULL, -- References the main entity (policy, claim, etc.)
    reference_type TEXT NOT NULL, -- 'policy', 'claim', 'financial_transaction', etc.
    current_step INTEGER NOT NULL DEFAULT 1,
    total_steps INTEGER NOT NULL DEFAULT 1,
    status approval_status NOT NULL DEFAULT 'pending',
    amount DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Workflow steps tracking
CREATE TABLE public.workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
    step_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    role_required TEXT NOT NULL,
    status approval_status NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit logs table for compliance
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    severity TEXT NOT NULL DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    recipient_email TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- Enable RLS on all tables
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discharge_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id(user_id UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

-- RLS Policies for organization-based access
-- Policies table
CREATE POLICY "Users can access their organization's policies" ON public.policies
    FOR ALL USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Quotes table  
CREATE POLICY "Users can access their organization's quotes" ON public.quotes
    FOR ALL USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Claims table
CREATE POLICY "Users can access their organization's claims" ON public.claims
    FOR ALL USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Financial transactions table
CREATE POLICY "Users can access their organization's financial transactions" ON public.financial_transactions
    FOR ALL USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Settlement vouchers table
CREATE POLICY "Users can access their organization's settlement vouchers" ON public.settlement_vouchers
    FOR ALL USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Discharge vouchers table
CREATE POLICY "Users can access their organization's discharge vouchers" ON public.discharge_vouchers
    FOR ALL USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Workflows table
CREATE POLICY "Users can access their organization's workflows" ON public.workflows
    FOR ALL USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Workflow steps table
CREATE POLICY "Users can access workflow steps for their organization" ON public.workflow_steps
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.workflows w 
        WHERE w.id = workflow_steps.workflow_id 
        AND w.organization_id = public.get_user_organization_id(auth.uid())
    ));

-- Audit logs table
CREATE POLICY "Users can access their organization's audit logs" ON public.audit_logs
    FOR ALL USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Notifications table
CREATE POLICY "Users can access their organization's notifications" ON public.notifications
    FOR ALL USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_policies_organization_id ON public.policies(organization_id);
CREATE INDEX idx_policies_policy_number ON public.policies(policy_number);
CREATE INDEX idx_policies_status ON public.policies(status);
CREATE INDEX idx_policies_end_date ON public.policies(end_date);

CREATE INDEX idx_quotes_organization_id ON public.quotes(organization_id);
CREATE INDEX idx_quotes_quote_number ON public.quotes(quote_number);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_valid_until ON public.quotes(valid_until);

CREATE INDEX idx_claims_organization_id ON public.claims(organization_id);
CREATE INDEX idx_claims_claim_number ON public.claims(claim_number);
CREATE INDEX idx_claims_policy_id ON public.claims(policy_id);
CREATE INDEX idx_claims_status ON public.claims(status);

CREATE INDEX idx_financial_transactions_organization_id ON public.financial_transactions(organization_id);
CREATE INDEX idx_financial_transactions_policy_id ON public.financial_transactions(policy_id);
CREATE INDEX idx_financial_transactions_type ON public.financial_transactions(transaction_type);
CREATE INDEX idx_financial_transactions_status ON public.financial_transactions(status);

CREATE INDEX idx_workflows_organization_id ON public.workflows(organization_id);
CREATE INDEX idx_workflows_reference ON public.workflows(reference_id, reference_type);
CREATE INDEX idx_workflows_status ON public.workflows(status);

CREATE INDEX idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Create trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_policies_updated_at BEFORE UPDATE ON public.policies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_quotes_updated_at BEFORE UPDATE ON public.quotes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_claims_updated_at BEFORE UPDATE ON public.claims
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_workflows_updated_at BEFORE UPDATE ON public.workflows
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
