
-- Add missing INSERT policy for organizations table
CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (true);

-- Add missing INSERT policies for user_roles
CREATE POLICY "Users can create their own roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Add missing INSERT policy for team_invitations  
CREATE POLICY "Admins can create invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'SuperAdmin') 
    OR public.has_role(auth.uid(), 'BrokerAdmin')
  );
