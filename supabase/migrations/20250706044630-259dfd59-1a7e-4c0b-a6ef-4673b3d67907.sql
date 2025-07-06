-- Create admin configuration tables for client onboarding dropdown options
CREATE TABLE IF NOT EXISTS public.client_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, value)
);

CREATE TABLE IF NOT EXISTS public.client_industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, value)
);

CREATE TABLE IF NOT EXISTS public.client_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, value)
);

CREATE TABLE IF NOT EXISTS public.account_officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.client_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_industries ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.client_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_officers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "client_classifications_org_access" ON public.client_classifications
  FOR ALL TO authenticated
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "client_industries_org_access" ON public.client_industries
  FOR ALL TO authenticated  
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "client_sources_org_access" ON public.client_sources
  FOR ALL TO authenticated
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "account_officers_org_access" ON public.account_officers
  FOR ALL TO authenticated
  USING (organization_id = get_user_organization_id(auth.uid()));

-- Insert default data for existing organizations
INSERT INTO public.client_classifications (organization_id, value, label, sort_order)
SELECT id, 'corporate', 'Corporate', 1 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_classifications (organization_id, value, label, sort_order)
SELECT id, 'sme', 'Small & Medium Enterprise', 2 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_classifications (organization_id, value, label, sort_order)
SELECT id, 'individual', 'Individual', 3 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_classifications (organization_id, value, label, sort_order)
SELECT id, 'government', 'Government', 4 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_industries (organization_id, value, label, sort_order)
SELECT id, 'manufacturing', 'Manufacturing', 1 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_industries (organization_id, value, label, sort_order)
SELECT id, 'oil-gas', 'Oil & Gas', 2 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_industries (organization_id, value, label, sort_order)
SELECT id, 'construction', 'Construction', 3 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_industries (organization_id, value, label, sort_order)
SELECT id, 'healthcare', 'Healthcare', 4 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_industries (organization_id, value, label, sort_order)
SELECT id, 'technology', 'Technology', 5 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_industries (organization_id, value, label, sort_order)
SELECT id, 'finance', 'Financial Services', 6 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_industries (organization_id, value, label, sort_order)
SELECT id, 'retail', 'Retail', 7 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_industries (organization_id, value, label, sort_order)
SELECT id, 'agriculture', 'Agriculture', 8 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_industries (organization_id, value, label, sort_order)
SELECT id, 'transportation', 'Transportation', 9 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_industries (organization_id, value, label, sort_order)
SELECT id, 'education', 'Education', 10 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_sources (organization_id, value, label, sort_order)
SELECT id, 'referral', 'Referral', 1 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_sources (organization_id, value, label, sort_order)
SELECT id, 'website', 'Website', 2 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_sources (organization_id, value, label, sort_order)
SELECT id, 'social-media', 'Social Media', 3 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_sources (organization_id, value, label, sort_order)
SELECT id, 'direct-sales', 'Direct Sales', 4 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_sources (organization_id, value, label, sort_order)
SELECT id, 'partner', 'Partner', 5 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;

INSERT INTO public.client_sources (organization_id, value, label, sort_order)
SELECT id, 'advertisement', 'Advertisement', 6 FROM public.organizations
ON CONFLICT (organization_id, value) DO NOTHING;