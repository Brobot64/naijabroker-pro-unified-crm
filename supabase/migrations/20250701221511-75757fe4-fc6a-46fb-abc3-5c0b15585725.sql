
-- Phase 1: Create comprehensive database schema for Quote Management workflow

-- 1. Create clients table for client data persistence
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  client_code text NOT NULL,
  name text NOT NULL,
  address text,
  phone text,
  email text,
  source text,
  industry text,
  classification text,
  remark text,
  account_officer text,
  chairman text,
  md text,
  head_of_finance text,
  contact_name text,
  contact_address text,
  birthday date,
  anniversary date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  UNIQUE(organization_id, client_code)
);

-- 2. Add client_id to quotes table and update structure
ALTER TABLE public.quotes 
ADD COLUMN client_id uuid,
ADD COLUMN insurer_splits jsonb DEFAULT '[]'::jsonb,
ADD COLUMN commission_splits jsonb DEFAULT '[]'::jsonb,
ADD COLUMN calculations jsonb DEFAULT '{}'::jsonb,
ADD COLUMN rfq_document_url text,
ADD COLUMN interim_contract_url text,
ADD COLUMN final_contract_url text,
ADD COLUMN payment_status text DEFAULT 'pending',
ADD COLUMN payment_reference text,
ADD COLUMN workflow_stage text DEFAULT 'draft';

-- 3. Create quote_documents table for RFQ and contract storage
CREATE TABLE public.quote_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  quote_id uuid NOT NULL,
  document_type text NOT NULL, -- 'rfq', 'interim_contract', 'final_contract'
  document_url text NOT NULL,
  document_name text NOT NULL,
  file_size bigint,
  mime_type text,
  is_locked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- 4. Create insurer_responses table for quote evaluation
CREATE TABLE public.insurer_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  quote_id uuid NOT NULL,
  insurer_name text NOT NULL,
  premium_quoted numeric NOT NULL DEFAULT 0,
  coverage_limits jsonb DEFAULT '{}'::jsonb,
  exclusions text[],
  terms_conditions text,
  response_date timestamp with time zone DEFAULT now(),
  rating_score numeric DEFAULT 0,
  is_selected boolean DEFAULT false,
  remarks text,
  document_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Create insurers master table
CREATE TABLE public.insurers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  rating numeric DEFAULT 0,
  specialties text[],
  performance_score numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. Create client_portal_sessions table for secure client access
CREATE TABLE public.client_portal_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  quote_id uuid NOT NULL,
  client_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Create comprehensive audit trail table for quote workflow
CREATE TABLE public.quote_audit_trail (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  quote_id uuid NOT NULL,
  action text NOT NULL,
  stage text NOT NULL,
  user_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- 8. Enable RLS on all new tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurer_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_audit_trail ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for organization-scoped access
CREATE POLICY "clients_org_access" ON public.clients FOR ALL 
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "quote_documents_org_access" ON public.quote_documents FOR ALL 
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "insurer_responses_org_access" ON public.insurer_responses FOR ALL 
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "insurers_org_access" ON public.insurers FOR ALL 
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "client_portal_sessions_org_access" ON public.client_portal_sessions FOR ALL 
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "quote_audit_trail_org_access" ON public.quote_audit_trail FOR ALL 
USING (organization_id = get_user_organization_id(auth.uid()));

-- 10. Add foreign key constraints for referential integrity
ALTER TABLE public.clients 
  ADD CONSTRAINT fk_clients_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.quotes 
  ADD CONSTRAINT fk_quotes_client 
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

ALTER TABLE public.quote_documents 
  ADD CONSTRAINT fk_quote_documents_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_quote_documents_quote 
  FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

ALTER TABLE public.insurer_responses 
  ADD CONSTRAINT fk_insurer_responses_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_insurer_responses_quote 
  FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

ALTER TABLE public.insurers 
  ADD CONSTRAINT fk_insurers_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.client_portal_sessions 
  ADD CONSTRAINT fk_client_portal_sessions_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_client_portal_sessions_quote 
  FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_client_portal_sessions_client 
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

ALTER TABLE public.quote_audit_trail 
  ADD CONSTRAINT fk_quote_audit_trail_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_quote_audit_trail_quote 
  FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

-- 11. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_clients_organization_code ON public.clients(organization_id, client_code);
CREATE INDEX IF NOT EXISTS idx_clients_organization_name ON public.clients(organization_id, name);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_workflow_stage ON public.quotes(organization_id, workflow_stage);
CREATE INDEX IF NOT EXISTS idx_quote_documents_quote_type ON public.quote_documents(quote_id, document_type);
CREATE INDEX IF NOT EXISTS idx_insurer_responses_quote_id ON public.insurer_responses(quote_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_sessions_token ON public.client_portal_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_quote_audit_trail_quote_stage ON public.quote_audit_trail(quote_id, stage);

-- 12. Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables that need them
CREATE TRIGGER handle_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_insurers_updated_at BEFORE UPDATE ON public.insurers
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 13. Create function to generate unique client codes
CREATE OR REPLACE FUNCTION public.generate_client_code(org_id uuid)
RETURNS text AS $$
DECLARE
    code_prefix text;
    code_number integer;
    new_code text;
BEGIN
    -- Get organization name for prefix (first 3 characters, uppercase)
    SELECT UPPER(LEFT(name, 3)) INTO code_prefix FROM public.organizations WHERE id = org_id;
    
    -- Get next sequence number for this organization
    SELECT COALESCE(MAX(CAST(SUBSTRING(client_code FROM 4) AS integer)), 0) + 1 
    INTO code_number 
    FROM public.clients 
    WHERE organization_id = org_id AND client_code ~ '^[A-Z]{3}[0-9]+$';
    
    -- Format as ORG0001, ORG0002, etc.
    new_code := code_prefix || LPAD(code_number::text, 4, '0');
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
