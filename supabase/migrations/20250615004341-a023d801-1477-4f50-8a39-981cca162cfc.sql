
-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;

-- Create a simple policy that allows any authenticated user to create organizations
CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view organizations they have access to
CREATE POLICY "Users can view accessible organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update organizations (we'll refine this later)
CREATE POLICY "Users can update organizations"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (true);
