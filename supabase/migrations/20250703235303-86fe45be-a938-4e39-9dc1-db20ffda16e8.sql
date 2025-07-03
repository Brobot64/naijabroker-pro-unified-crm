-- Create public access policy for client portal links
-- This allows unauthenticated users to read portal link data using the token

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "client_portal_links_public_token_access" ON public.client_portal_links;

-- Create new policy for public token-based access
CREATE POLICY "client_portal_links_public_token_access" 
ON public.client_portal_links 
FOR SELECT 
TO anon
USING (true);

-- Also allow authenticated users to continue accessing their org data
-- The existing org_access policy should handle this, but let's make sure it's there
DROP POLICY IF EXISTS "client_portal_links_org_access" ON public.client_portal_links;

CREATE POLICY "client_portal_links_org_access" 
ON public.client_portal_links 
FOR ALL 
TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));

-- Allow public updates for marking portal as used
CREATE POLICY "client_portal_links_public_update" 
ON public.client_portal_links 
FOR UPDATE 
TO anon
USING (true)
WITH CHECK (true);