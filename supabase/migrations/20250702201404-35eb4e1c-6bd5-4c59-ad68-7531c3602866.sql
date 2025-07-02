-- Create table for storing evaluated quotes with persistence
CREATE TABLE public.evaluated_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  quote_id UUID NOT NULL,
  insurer_id UUID,
  insurer_name TEXT NOT NULL,
  insurer_email TEXT,
  premium_quoted NUMERIC NOT NULL DEFAULT 0,
  commission_split NUMERIC NOT NULL DEFAULT 0,
  terms_conditions TEXT,
  exclusions TEXT[],
  coverage_limits JSONB DEFAULT '{}',
  rating_score NUMERIC DEFAULT 0,
  remarks TEXT,
  document_url TEXT,
  response_received BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  source TEXT NOT NULL DEFAULT 'dispatched', -- 'dispatched' or 'manual'
  evaluation_source TEXT, -- 'human' or 'ai'
  ai_analysis JSONB,
  dispatched_at TIMESTAMPTZ,
  evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evaluated_quotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "evaluated_quotes_org_access" ON public.evaluated_quotes
FOR ALL
USING (organization_id = get_user_organization_id(auth.uid()));

-- Create client portal links table
CREATE TABLE public.client_portal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  quote_id UUID NOT NULL,
  client_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  evaluated_quotes_data JSONB NOT NULL
);

-- Enable RLS for client portal links
ALTER TABLE public.client_portal_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for client portal links
CREATE POLICY "client_portal_links_org_access" ON public.client_portal_links
FOR ALL
USING (organization_id = get_user_organization_id(auth.uid()));

-- Create email notifications table
CREATE TABLE public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for email notifications
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for email notifications
CREATE POLICY "email_notifications_org_access" ON public.email_notifications
FOR ALL
USING (organization_id = get_user_organization_id(auth.uid()));

-- Create payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  quote_id UUID NOT NULL,
  client_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  payment_method TEXT NOT NULL,
  payment_provider TEXT, -- 'paystack', 'flutterwave', 'bank_transfer'
  provider_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Enable RLS for payment transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for payment transactions
CREATE POLICY "payment_transactions_org_access" ON public.payment_transactions
FOR ALL
USING (organization_id = get_user_organization_id(auth.uid()));

-- Add foreign key constraints
ALTER TABLE public.evaluated_quotes
ADD CONSTRAINT fk_evaluated_quotes_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.evaluated_quotes
ADD CONSTRAINT fk_evaluated_quotes_quote 
FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

ALTER TABLE public.client_portal_links
ADD CONSTRAINT fk_client_portal_links_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.client_portal_links
ADD CONSTRAINT fk_client_portal_links_quote 
FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

ALTER TABLE public.client_portal_links
ADD CONSTRAINT fk_client_portal_links_client 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

ALTER TABLE public.email_notifications
ADD CONSTRAINT fk_email_notifications_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.payment_transactions
ADD CONSTRAINT fk_payment_transactions_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.payment_transactions
ADD CONSTRAINT fk_payment_transactions_quote 
FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

ALTER TABLE public.payment_transactions
ADD CONSTRAINT fk_payment_transactions_client 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_evaluated_quotes_quote_id ON public.evaluated_quotes(quote_id);
CREATE INDEX idx_evaluated_quotes_org_id ON public.evaluated_quotes(organization_id);
CREATE INDEX idx_client_portal_links_token ON public.client_portal_links(token);
CREATE INDEX idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);