
-- Fix critical RLS policies for all tables
-- First, add missing RLS policies for organization-based access

-- Policies table RLS (already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Users can access their organization's policies" ON public.policies;
CREATE POLICY "Users can access their organization's policies" 
  ON public.policies FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Quotes table RLS (already exists but let's ensure it's correct)  
DROP POLICY IF EXISTS "Users can access their organization's quotes" ON public.quotes;
CREATE POLICY "Users can access their organization's quotes" 
  ON public.quotes FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Claims table RLS (already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Users can access their organization's claims" ON public.claims;
CREATE POLICY "Users can access their organization's claims" 
  ON public.claims FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Financial transactions table RLS (already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Users can access their organization's financial transactions" ON public.financial_transactions;
CREATE POLICY "Users can access their organization's financial transactions" 
  ON public.financial_transactions FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Settlement vouchers table RLS (already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Users can access their organization's settlement vouchers" ON public.settlement_vouchers;
CREATE POLICY "Users can access their organization's settlement vouchers" 
  ON public.settlement_vouchers FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Discharge vouchers table RLS (already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Users can access their organization's discharge vouchers" ON public.discharge_vouchers;
CREATE POLICY "Users can access their organization's discharge vouchers" 
  ON public.discharge_vouchers FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Workflows table RLS (already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Users can access their organization's workflows" ON public.workflows;
CREATE POLICY "Users can access their organization's workflows" 
  ON public.workflows FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Workflow steps table RLS (already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Users can access workflow steps for their organization" ON public.workflow_steps;
CREATE POLICY "Users can access workflow steps for their organization" 
  ON public.workflow_steps FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.workflows w 
    WHERE w.id = workflow_steps.workflow_id 
    AND w.organization_id = public.get_user_organization_id(auth.uid())
  ));

-- Audit logs table RLS (already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Users can access their organization's audit logs" ON public.audit_logs;
CREATE POLICY "Users can access their organization's audit logs" 
  ON public.audit_logs FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Notifications table RLS (already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Users can access their organization's notifications" ON public.notifications;
CREATE POLICY "Users can access their organization's notifications" 
  ON public.notifications FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Add missing foreign keys for referential integrity
ALTER TABLE public.policies 
  ADD CONSTRAINT fk_policies_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.policies 
  ADD CONSTRAINT fk_policies_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.quotes 
  ADD CONSTRAINT fk_quotes_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.quotes 
  ADD CONSTRAINT fk_quotes_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.quotes 
  ADD CONSTRAINT fk_quotes_converted_policy 
  FOREIGN KEY (converted_to_policy) REFERENCES public.policies(id) ON DELETE SET NULL;

ALTER TABLE public.claims 
  ADD CONSTRAINT fk_claims_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.claims 
  ADD CONSTRAINT fk_claims_policy 
  FOREIGN KEY (policy_id) REFERENCES public.policies(id) ON DELETE CASCADE;

ALTER TABLE public.claims 
  ADD CONSTRAINT fk_claims_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.claims 
  ADD CONSTRAINT fk_claims_assigned_adjuster 
  FOREIGN KEY (assigned_adjuster) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.financial_transactions 
  ADD CONSTRAINT fk_financial_transactions_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.financial_transactions 
  ADD CONSTRAINT fk_financial_transactions_policy 
  FOREIGN KEY (policy_id) REFERENCES public.policies(id) ON DELETE SET NULL;

ALTER TABLE public.financial_transactions 
  ADD CONSTRAINT fk_financial_transactions_claim 
  FOREIGN KEY (claim_id) REFERENCES public.claims(id) ON DELETE SET NULL;

ALTER TABLE public.financial_transactions 
  ADD CONSTRAINT fk_financial_transactions_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.financial_transactions 
  ADD CONSTRAINT fk_financial_transactions_approved_by 
  FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.settlement_vouchers 
  ADD CONSTRAINT fk_settlement_vouchers_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.settlement_vouchers 
  ADD CONSTRAINT fk_settlement_vouchers_claim 
  FOREIGN KEY (claim_id) REFERENCES public.claims(id) ON DELETE CASCADE;

ALTER TABLE public.settlement_vouchers 
  ADD CONSTRAINT fk_settlement_vouchers_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.discharge_vouchers 
  ADD CONSTRAINT fk_discharge_vouchers_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.discharge_vouchers 
  ADD CONSTRAINT fk_discharge_vouchers_settlement 
  FOREIGN KEY (settlement_voucher_id) REFERENCES public.settlement_vouchers(id) ON DELETE CASCADE;

ALTER TABLE public.discharge_vouchers 
  ADD CONSTRAINT fk_discharge_vouchers_claim 
  FOREIGN KEY (claim_id) REFERENCES public.claims(id) ON DELETE CASCADE;

ALTER TABLE public.discharge_vouchers 
  ADD CONSTRAINT fk_discharge_vouchers_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.discharge_vouchers 
  ADD CONSTRAINT fk_discharge_vouchers_approved_by 
  FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.workflows 
  ADD CONSTRAINT fk_workflows_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.workflows 
  ADD CONSTRAINT fk_workflows_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.workflows 
  ADD CONSTRAINT fk_workflows_assigned_to 
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.workflow_steps 
  ADD CONSTRAINT fk_workflow_steps_workflow 
  FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;

ALTER TABLE public.workflow_steps 
  ADD CONSTRAINT fk_workflow_steps_assigned_to 
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.workflow_steps 
  ADD CONSTRAINT fk_workflow_steps_approved_by 
  FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.audit_logs 
  ADD CONSTRAINT fk_audit_logs_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.audit_logs 
  ADD CONSTRAINT fk_audit_logs_user 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.notifications 
  ADD CONSTRAINT fk_notifications_organization 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_policies_organization_status ON public.policies(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_policies_created_by ON public.policies(created_by);
CREATE INDEX IF NOT EXISTS idx_quotes_organization_status ON public.quotes(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_by ON public.quotes(created_by);
CREATE INDEX IF NOT EXISTS idx_claims_organization_status ON public.claims(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_claims_created_by ON public.claims(created_by);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_organization_type ON public.financial_transactions(organization_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_workflows_organization_status ON public.workflows(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_status ON public.workflow_steps(workflow_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_created_at ON public.audit_logs(organization_id, created_at);
