
-- First, let's see what policies currently exist and then fix them
-- Drop any remaining conflicting policies
DROP POLICY IF EXISTS "Users can create organizations during onboarding" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

-- Create a simple, permissive policy for organization creation during onboarding
CREATE POLICY "Allow organization creation for authenticated users"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also ensure profiles can be updated during onboarding
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Ensure user_roles insertion works during onboarding
DROP POLICY IF EXISTS "Users can create roles during onboarding" ON public.user_roles;

CREATE POLICY "Users can create roles during onboarding"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
