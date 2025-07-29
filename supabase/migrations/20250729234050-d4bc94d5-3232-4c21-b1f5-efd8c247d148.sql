-- Create claim audit trail table for comprehensive logging
CREATE TABLE IF NOT EXISTS public.claim_audit_trail (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  stage TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the claim audit trail table
ALTER TABLE public.claim_audit_trail ENABLE ROW LEVEL SECURITY;

-- Create policies for claim audit trail access
CREATE POLICY "Users can view audit trail for their organization claims" 
ON public.claim_audit_trail 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert audit trail entries for their organization" 
ON public.claim_audit_trail 
FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claim_audit_trail_claim_id ON public.claim_audit_trail(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_audit_trail_organization_id ON public.claim_audit_trail(organization_id);
CREATE INDEX IF NOT EXISTS idx_claim_audit_trail_created_at ON public.claim_audit_trail(created_at DESC);

-- Add trigger for updating timestamps
CREATE TRIGGER update_claim_audit_trail_updated_at
  BEFORE UPDATE ON public.claim_audit_trail
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();