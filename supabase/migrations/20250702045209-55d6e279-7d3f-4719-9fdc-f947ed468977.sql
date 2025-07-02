-- Create insurer responses table for storing quotes received from insurers
CREATE TABLE IF NOT EXISTS public.insurer_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  quote_id UUID NOT NULL,
  insurer_name TEXT NOT NULL,
  premium_quoted NUMERIC NOT NULL DEFAULT 0,
  terms_conditions TEXT,
  exclusions TEXT[],
  coverage_limits JSONB DEFAULT '{}',
  document_url TEXT,
  rating_score NUMERIC DEFAULT 0,
  is_selected BOOLEAN DEFAULT false,
  remarks TEXT,
  response_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.insurer_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "insurer_responses_org_access" ON public.insurer_responses
FOR ALL USING (organization_id = get_user_organization_id(auth.uid()));

-- Add foreign key relationships
ALTER TABLE public.insurer_responses 
ADD CONSTRAINT fk_insurer_responses_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
ADD CONSTRAINT fk_insurer_responses_quote 
FOREIGN KEY (quote_id) REFERENCES public.quotes(id);