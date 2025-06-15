
-- Drop ALL existing policies first to ensure clean state
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view accessible organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations during onboarding" ON public.organizations;

-- Drop user_roles policies
DROP POLICY IF EXISTS "Users can view roles in their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create roles during onboarding" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in their organization" ON public.user_roles;

-- Drop team_invitations policies
DROP POLICY IF EXISTS "Users can view invitations for their organization" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Admins can manage invitations for their organization" ON public.team_invitations;

-- Now create the corrected policies
-- Organizations policies
CREATE POLICY "Users can create organizations during onboarding"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update their organization"
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

-- User roles policies
CREATE POLICY "Users can view roles in their organization"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create roles during onboarding"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Team invitations policies
CREATE POLICY "Users can view invitations for their organization"
  ON public.team_invitations FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can create invitations"
  ON public.team_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
  );
