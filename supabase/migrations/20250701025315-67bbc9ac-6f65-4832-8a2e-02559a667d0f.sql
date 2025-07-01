
-- Drop existing policies first to avoid conflicts, then recreate them
-- This ensures we have a clean, consistent set of RLS policies

-- Drop existing policies on organizations
DROP POLICY IF EXISTS "Users can create organizations during onboarding" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;
DROP POLICY IF EXISTS "authenticated_users_can_create_organizations" ON public.organizations;
DROP POLICY IF EXISTS "users_can_view_their_organization" ON public.organizations;
DROP POLICY IF EXISTS "admins_can_update_organization" ON public.organizations;
DROP POLICY IF EXISTS "allow_all_authenticated_inserts" ON public.organizations;
DROP POLICY IF EXISTS "allow_all_authenticated_selects" ON public.organizations;

-- Drop existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Drop existing policies on user_roles
DROP POLICY IF EXISTS "Users can view roles in their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create roles during onboarding" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create their own roles" ON public.user_roles;

-- Drop existing policies on team_invitations
DROP POLICY IF EXISTS "Users can view invitations for their organization" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can manage invitations for their organization" ON public.team_invitations;

-- Drop existing policies on other tables
DROP POLICY IF EXISTS "Users can access their organization's policies" ON public.policies;
DROP POLICY IF EXISTS "Users can access their organization's quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can access their organization's claims" ON public.claims;
DROP POLICY IF EXISTS "Users can access their organization's financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can access their organization's settlement vouchers" ON public.settlement_vouchers;
DROP POLICY IF EXISTS "Users can access their organization's discharge vouchers" ON public.discharge_vouchers;
DROP POLICY IF EXISTS "Users can access their organization's workflows" ON public.workflows;
DROP POLICY IF EXISTS "Users can access workflow steps for their organization" ON public.workflow_steps;
DROP POLICY IF EXISTS "Users can access their organization's audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can access their organization's notifications" ON public.notifications;

-- Now create the comprehensive RLS policies

-- Organizations policies
CREATE POLICY "org_insert_authenticated"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "org_select_own_organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "org_update_admin_only"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    id = public.get_user_organization_id(auth.uid())
    AND public.has_role(auth.uid(), 'SuperAdmin'::app_role)
  );

-- Profiles policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- User roles policies
CREATE POLICY "user_roles_select_org"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "user_roles_insert_own"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_roles_update_admin"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id(auth.uid())
    AND public.has_role(auth.uid(), 'SuperAdmin'::app_role)
  );

-- Team invitations policies
CREATE POLICY "invitations_select_org"
  ON public.team_invitations FOR SELECT
  TO authenticated
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "invitations_insert_admin"
  ON public.team_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
    AND organization_id = public.get_user_organization_id(auth.uid())
    AND public.has_role(auth.uid(), 'SuperAdmin'::app_role)
  );

CREATE POLICY "invitations_update_admin"
  ON public.team_invitations FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id(auth.uid())
    AND public.has_role(auth.uid(), 'SuperAdmin'::app_role)
  );

-- Business data policies (organization-scoped)
CREATE POLICY "policies_org_access" 
  ON public.policies FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "quotes_org_access" 
  ON public.quotes FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "claims_org_access" 
  ON public.claims FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "financial_transactions_org_access" 
  ON public.financial_transactions FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "settlement_vouchers_org_access" 
  ON public.settlement_vouchers FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "discharge_vouchers_org_access" 
  ON public.discharge_vouchers FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "workflows_org_access" 
  ON public.workflows FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "workflow_steps_org_access" 
  ON public.workflow_steps FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.workflows w 
    WHERE w.id = workflow_steps.workflow_id 
    AND w.organization_id = public.get_user_organization_id(auth.uid())
  ));

CREATE POLICY "audit_logs_org_access" 
  ON public.audit_logs FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "notifications_org_access" 
  ON public.notifications FOR ALL 
  USING (organization_id = public.get_user_organization_id(auth.uid()));
