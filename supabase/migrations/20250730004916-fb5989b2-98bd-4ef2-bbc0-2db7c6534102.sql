-- Create table for claim portal links
CREATE TABLE public.claim_portal_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  claim_id UUID NOT NULL,
  client_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claim_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.claim_portal_links ENABLE ROW LEVEL SECURITY;

-- Create policies for claim portal links
CREATE POLICY "claim_portal_links_org_access" 
ON public.claim_portal_links 
FOR ALL 
USING (organization_id = get_user_organization_id(auth.uid()));

-- Create policy for public access to portal links (needed for client access)
CREATE POLICY "claim_portal_links_public_token_access" 
ON public.claim_portal_links 
FOR SELECT 
USING (true);

-- Create policy for public updates (needed for marking as used)
CREATE POLICY "claim_portal_links_public_update" 
ON public.claim_portal_links 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_claim_portal_links_token ON public.claim_portal_links(token);
CREATE INDEX idx_claim_portal_links_claim_id ON public.claim_portal_links(claim_id);
CREATE INDEX idx_claim_portal_links_organization_id ON public.claim_portal_links(organization_id);