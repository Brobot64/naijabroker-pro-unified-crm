
-- Fix the RLS policy for organizations table to allow users to create organizations
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also ensure the existing policies work correctly
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;

CREATE POLICY "Users can view their organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (id = public.get_user_organization(auth.uid()));

CREATE POLICY "Admins can update their organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    id = public.get_user_organization(auth.uid()) 
    AND (
      public.has_role(auth.uid(), 'SuperAdmin') 
      OR public.has_role(auth.uid(), 'BrokerAdmin')
    )
  );
