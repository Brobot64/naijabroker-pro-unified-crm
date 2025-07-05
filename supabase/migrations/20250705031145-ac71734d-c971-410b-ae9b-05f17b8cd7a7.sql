-- Fix RLS policies for organizations table to allow onboarding
-- Remove any conflicting policies and create a clean set

-- Drop all existing policies on organizations table
DROP POLICY IF EXISTS "org_insert_authenticated" ON public.organizations;
DROP POLICY IF EXISTS "org_select_own_organization" ON public.organizations;
DROP POLICY IF EXISTS "org_update_admin_only" ON public.organizations;
DROP POLICY IF EXISTS "authenticated_users_can_create_organizations" ON public.organizations;
DROP POLICY IF EXISTS "users_can_view_their_organization" ON public.organizations;
DROP POLICY IF EXISTS "admins_can_update_organization" ON public.organizations;

-- Create simple, clear policies for organizations
-- Allow any authenticated user to create organizations (for onboarding)
CREATE POLICY "allow_authenticated_insert_organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view organizations they belong to
CREATE POLICY "allow_view_own_organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Allow admins to update their organization
CREATE POLICY "allow_admin_update_organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('SuperAdmin', 'BrokerAdmin')
      AND organization_id = organizations.id
    )
  );