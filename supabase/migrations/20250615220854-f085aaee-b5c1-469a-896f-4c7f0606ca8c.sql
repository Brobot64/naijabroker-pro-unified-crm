
-- Disable RLS temporarily to clean up
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on organizations table
DROP POLICY IF EXISTS "Allow organization creation for authenticated users" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations during onboarding" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view accessible organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can update organizations" ON public.organizations;

-- Re-enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create a single, simple INSERT policy for onboarding
CREATE POLICY "authenticated_users_can_create_organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create a simple SELECT policy
CREATE POLICY "users_can_view_their_organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Create a simple UPDATE policy for admins
CREATE POLICY "admins_can_update_organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('SuperAdmin', 'BrokerAdmin')
    )
  );
