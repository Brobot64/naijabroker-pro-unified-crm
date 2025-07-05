-- Temporarily create a more permissive policy for testing
-- This will help us identify if it's an auth context issue

-- Drop the current INSERT policy
DROP POLICY IF EXISTS "allow_authenticated_insert_organizations" ON public.organizations;

-- Create a temporary policy that allows authenticated users to insert without additional checks
CREATE POLICY "temp_allow_org_insert"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also create a policy for anon users temporarily to test
CREATE POLICY "temp_allow_anon_org_insert"
  ON public.organizations FOR INSERT
  TO anon
  WITH CHECK (true);