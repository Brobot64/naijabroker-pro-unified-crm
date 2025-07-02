
-- Create clauses table for storing clause templates
CREATE TABLE public.clauses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('extension', 'exclusion', 'warranty', 'deductible', 'condition')),
  policy_types TEXT[] DEFAULT '{}', -- Which policy types this clause applies to
  clause_text TEXT NOT NULL,
  premium_impact_type TEXT CHECK (premium_impact_type IN ('percentage', 'fixed', 'none')) DEFAULT 'none',
  premium_impact_value NUMERIC DEFAULT 0,
  is_recommended BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Create add_ons table for storing add-on templates  
CREATE TABLE public.add_ons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  policy_types TEXT[] DEFAULT '{}', -- Which policy types this add-on applies to
  coverage_details TEXT,
  premium_impact_type TEXT CHECK (premium_impact_type IN ('percentage', 'fixed', 'none')) DEFAULT 'none',
  premium_impact_value NUMERIC DEFAULT 0,
  sum_insured_impact NUMERIC DEFAULT 0,
  is_recommended BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Create quote_clauses junction table for selected clauses per quote
CREATE TABLE public.quote_clauses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  clause_id UUID,
  custom_name TEXT, -- For manual/custom clauses
  custom_description TEXT,
  custom_clause_text TEXT,
  category TEXT NOT NULL,
  premium_impact_type TEXT DEFAULT 'none',
  premium_impact_value NUMERIC DEFAULT 0,
  is_custom BOOLEAN DEFAULT false,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quote_add_ons junction table for selected add-ons per quote
CREATE TABLE public.quote_add_ons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  add_on_id UUID,
  custom_name TEXT, -- For manual/custom add-ons
  custom_description TEXT,
  custom_coverage_details TEXT,
  premium_impact_type TEXT DEFAULT 'none',
  premium_impact_value NUMERIC DEFAULT 0,
  sum_insured_impact NUMERIC DEFAULT 0,
  is_custom BOOLEAN DEFAULT false,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_add_ons ENABLE ROW LEVEL SECURITY;

-- RLS policies for clauses
CREATE POLICY "clauses_org_access" ON public.clauses
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()));

-- RLS policies for add_ons
CREATE POLICY "add_ons_org_access" ON public.add_ons
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()));

-- RLS policies for quote_clauses
CREATE POLICY "quote_clauses_org_access" ON public.quote_clauses
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()));

-- RLS policies for quote_add_ons
CREATE POLICY "quote_add_ons_org_access" ON public.quote_add_ons
  FOR ALL USING (organization_id = get_user_organization_id(auth.uid()));

-- Add foreign key constraints
ALTER TABLE public.quote_clauses 
  ADD CONSTRAINT fk_quote_clauses_quote 
  FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

ALTER TABLE public.quote_clauses 
  ADD CONSTRAINT fk_quote_clauses_clause 
  FOREIGN KEY (clause_id) REFERENCES public.clauses(id) ON DELETE SET NULL;

ALTER TABLE public.quote_add_ons 
  ADD CONSTRAINT fk_quote_add_ons_quote 
  FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

ALTER TABLE public.quote_add_ons 
  ADD CONSTRAINT fk_quote_add_ons_add_on 
  FOREIGN KEY (add_on_id) REFERENCES public.add_ons(id) ON DELETE SET NULL;

-- Add triggers for updated_at
CREATE TRIGGER handle_updated_at_clauses
  BEFORE UPDATE ON public.clauses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_add_ons
  BEFORE UPDATE ON public.add_ons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert some default clauses and add-ons
INSERT INTO public.clauses (name, description, category, policy_types, clause_text, premium_impact_type, premium_impact_value, is_recommended, organization_id) 
SELECT 
  'Flood Cover Extension',
  'Extends coverage to include flood damage',
  'extension',
  ARRAY['fire', 'engineering', 'marine'],
  'This policy is extended to cover loss or damage directly caused by flood, subject to the terms, conditions and exclusions of this policy.',
  'percentage',
  5.0,
  true,
  id
FROM public.organizations
WHERE EXISTS (SELECT 1 FROM public.organizations);

INSERT INTO public.clauses (name, description, category, policy_types, clause_text, premium_impact_type, premium_impact_value, is_recommended, organization_id)
SELECT 
  'Terrorism Exclusion',
  'Excludes damages caused by terrorist activities',
  'exclusion',
  ARRAY['fire', 'marine', 'aviation', 'engineering'],
  'This policy does not cover loss or damage directly or indirectly caused by, contributed to, or arising from acts of terrorism.',
  'percentage',
  -2.0,
  false,
  id
FROM public.organizations
WHERE EXISTS (SELECT 1 FROM public.organizations);

INSERT INTO public.add_ons (name, description, category, policy_types, coverage_details, premium_impact_type, premium_impact_value, is_recommended, organization_id)
SELECT 
  'Personal Accident Cover',
  'Additional coverage for personal accidents',
  'personal_cover',
  ARRAY['motor', 'general-accident'],
  'Covers medical expenses and compensation for personal accidents up to the sum insured limit.',
  'fixed',
  25000.0,
  true,
  id
FROM public.organizations
WHERE EXISTS (SELECT 1 FROM public.organizations);
