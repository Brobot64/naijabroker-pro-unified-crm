-- Create missing client portal link for the test quote
INSERT INTO client_portal_links (
  organization_id,
  quote_id,
  client_id,
  token,
  expires_at,
  is_used,
  evaluated_quotes_data
)
SELECT 
  q.organization_id,
  q.id,
  q.client_id,
  'LEAP0000002-' || EXTRACT(EPOCH FROM NOW())::text,
  NOW() + INTERVAL '72 hours',
  false,
  '[]'::jsonb
FROM quotes q
WHERE q.id = '1bf66a89-f232-4ebc-b4e2-ca9f28bb7d80'
AND NOT EXISTS (
  SELECT 1 FROM client_portal_links cpl 
  WHERE cpl.quote_id = q.id
);

-- Verify the quote status and ensure consistency
UPDATE quotes 
SET 
  updated_at = now()
WHERE id = '1bf66a89-f232-4ebc-b4e2-ca9f28bb7d80';