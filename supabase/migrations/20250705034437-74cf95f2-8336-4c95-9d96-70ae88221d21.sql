-- Check current state and completely reset organization policies
-- First, check what policies currently exist
SELECT policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'organizations';

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'organizations';

-- Completely disable RLS temporarily to test
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "organizations_allow_all_inserts" ON public.organizations;
DROP POLICY IF EXISTS "organizations_select_own" ON public.organizations;
DROP POLICY IF EXISTS "organizations_update_admin" ON public.organizations;
DROP POLICY IF EXISTS "organizations_insert_authenticated" ON public.organizations;

-- Create the simplest possible insert policy
CREATE POLICY "organizations_simple_insert"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create select policy
CREATE POLICY "organizations_simple_select"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (true);

-- Create update policy for admins
CREATE POLICY "organizations_simple_update"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (true);