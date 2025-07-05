-- Temporarily disable RLS on organizations table to test if that's the issue
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean slate
DROP POLICY IF EXISTS "temp_allow_org_insert" ON public.organizations;
DROP POLICY IF EXISTS "temp_allow_anon_org_insert" ON public.organizations;
DROP POLICY IF EXISTS "allow_view_own_organization" ON public.organizations;
DROP POLICY IF EXISTS "allow_admin_update_organization" ON public.organizations;