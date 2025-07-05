-- Step 6: Ensure all business data tables have organization-scoped policies
-- Team invitations policies
DROP POLICY IF EXISTS "invitations_select_org" ON public.team_invitations;
DROP POLICY IF EXISTS "invitations_insert_admin" ON public.team_invitations;
DROP POLICY IF EXISTS "invitations_update_admin" ON public.team_invitations;

CREATE POLICY "team_invitations_select_org"
  ON public.team_invitations FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "team_invitations_insert_admin"
  ON public.team_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
    AND organization_id = public.get_user_organization_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'SuperAdmin'::app_role)
      OR public.has_role(auth.uid(), 'BrokerAdmin'::app_role)
    )
  );

CREATE POLICY "team_invitations_update_admin"
  ON public.team_invitations FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'SuperAdmin'::app_role)
      OR public.has_role(auth.uid(), 'BrokerAdmin'::app_role)
    )
  );

-- Business data policies (organization-scoped access)
-- These policies ensure users can only access data from their own organization
DROP POLICY IF EXISTS "policies_org_access" ON public.policies;
DROP POLICY IF EXISTS "quotes_org_access" ON public.quotes;
DROP POLICY IF EXISTS "claims_org_access" ON public.claims;
DROP POLICY IF EXISTS "clients_org_access" ON public.clients;

CREATE POLICY "policies_org_access" 
  ON public.policies FOR ALL 
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "quotes_org_access" 
  ON public.quotes FOR ALL 
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "claims_org_access" 
  ON public.claims FOR ALL 
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "clients_org_access" 
  ON public.clients FOR ALL 
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Financial and workflow tables
DROP POLICY IF EXISTS "financial_transactions_org_access" ON public.financial_transactions;
DROP POLICY IF EXISTS "workflows_org_access" ON public.workflows;
DROP POLICY IF EXISTS "audit_logs_org_access" ON public.audit_logs;

CREATE POLICY "financial_transactions_org_access" 
  ON public.financial_transactions FOR ALL 
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "workflows_org_access" 
  ON public.workflows FOR ALL 
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "audit_logs_org_access" 
  ON public.audit_logs FOR ALL 
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));