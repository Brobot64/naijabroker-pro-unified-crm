-- Insert some sample insurers for testing
INSERT INTO public.insurers (organization_id, name, email, phone, address, specialties, is_active) VALUES
-- Use a placeholder organization_id - this will need to be updated with actual organization IDs
('00000000-0000-0000-0000-000000000000', 'AXA Mansard Insurance', 'quotes@axamansard.com', '+234-1-234-5678', 'Lagos, Nigeria', ARRAY['Motor', 'Fire', 'Marine'], true),
('00000000-0000-0000-0000-000000000000', 'AIICO Insurance Plc', 'quotes@aiicoplc.com', '+234-1-345-6789', 'Lagos, Nigeria', ARRAY['Life', 'General', 'Health'], true),
('00000000-0000-0000-0000-000000000000', 'Leadway Assurance', 'quotes@leadway.com', '+234-1-456-7890', 'Lagos, Nigeria', ARRAY['Motor', 'Property', 'Aviation'], true),
('00000000-0000-0000-0000-000000000000', 'NICON Insurance', 'quotes@niconinsurance.com', '+234-1-567-8901', 'Abuja, Nigeria', ARRAY['Engineering', 'Oil & Gas', 'Marine'], true),
('00000000-0000-0000-0000-000000000000', 'Cornerstone Insurance', 'quotes@cornerstone.com', '+234-1-678-9012', 'Lagos, Nigeria', ARRAY['Motor', 'Fire', 'Bonds'], true);

-- Update the organization_id to match existing organizations
UPDATE public.insurers 
SET organization_id = (
  SELECT id FROM public.organizations LIMIT 1
) 
WHERE organization_id = '00000000-0000-0000-0000-000000000000';