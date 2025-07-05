-- Fix organization security policies to be properly scoped
-- These were too permissive during debugging - now make them secure

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "organizations_simple_insert" ON public.organizations;
DROP POLICY IF EXISTS "organizations_simple_select" ON public.organizations;  
DROP POLICY IF EXISTS "organizations_simple_update" ON public.organizations;

-- Create secure organization policies
-- Allow authenticated users to insert organizations (for onboarding)
CREATE POLICY "organizations_insert_authenticated"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to select only their own organization
CREATE POLICY "organizations_select_own"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (id = public.get_user_organization_id(auth.uid()));

-- Allow only admins to update their organization
CREATE POLICY "organizations_update_admin"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    id = public.get_user_organization_id(auth.uid())
    AND (
      public.has_role(auth.uid(), 'SuperAdmin'::app_role) 
      OR public.has_role(auth.uid(), 'BrokerAdmin'::app_role)
    )
  );

-- Ensure no DELETE operations are allowed on organizations
-- (This is implicit - no DELETE policy means no DELETE access)

-- Verify team invitations have proper role-based access
DROP POLICY IF EXISTS "team_invitations_select_org" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_insert_admin" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_update_admin" ON public.team_invitations;

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