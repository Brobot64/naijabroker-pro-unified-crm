-- Insert some sample insurers for testing with the actual organization ID
INSERT INTO public.insurers (organization_id, name, email, phone, address, specialties, is_active) VALUES
('a3826873-0d7d-4ed9-9969-f5a5a0a9bce8', 'AXA Mansard Insurance', 'quotes@axamansard.com', '+234-1-234-5678', 'Lagos, Nigeria', ARRAY['Motor', 'Fire', 'Marine'], true),
('a3826873-0d7d-4ed9-9969-f5a5a0a9bce8', 'AIICO Insurance Plc', 'quotes@aiicoplc.com', '+234-1-345-6789', 'Lagos, Nigeria', ARRAY['Life', 'General', 'Health'], true),
('a3826873-0d7d-4ed9-9969-f5a5a0a9bce8', 'Leadway Assurance', 'quotes@leadway.com', '+234-1-456-7890', 'Lagos, Nigeria', ARRAY['Motor', 'Property', 'Aviation'], true),
('a3826873-0d7d-4ed9-9969-f5a5a0a9bce8', 'NICON Insurance', 'quotes@niconinsurance.com', '+234-1-567-8901', 'Abuja, Nigeria', ARRAY['Engineering', 'Oil & Gas', 'Marine'], true),
('a3826873-0d7d-4ed9-9969-f5a5a0a9bce8', 'Cornerstone Insurance', 'quotes@cornerstone.com', '+234-1-678-9012', 'Lagos, Nigeria', ARRAY['Motor', 'Fire', 'Bonds'], true);