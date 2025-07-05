-- Debug and fix organization RLS policies
-- Check current policies on organizations table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'organizations';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'organizations';

-- Let's drop all policies and recreate them with explicit debugging
DROP POLICY IF EXISTS "organizations_insert_authenticated" ON public.organizations;
DROP POLICY IF EXISTS "organizations_select_own" ON public.organizations;
DROP POLICY IF EXISTS "organizations_update_admin" ON public.organizations;
DROP POLICY IF EXISTS "organizations_allow_all_inserts" ON public.organizations;

-- Create the most permissive insert policy possible for debugging
CREATE POLICY "organizations_allow_all_inserts"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Keep the existing select policy
CREATE POLICY "organizations_select_own"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (id = public.get_user_organization_id(auth.uid()));

-- Keep the existing update policy  
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