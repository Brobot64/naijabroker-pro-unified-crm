-- Test workflow progression by manually updating the quote
UPDATE quotes 
SET 
  workflow_stage = 'client_approved',
  status = 'accepted',
  payment_status = 'pending',
  updated_at = now()
WHERE id = '1bf66a89-f232-4ebc-b4e2-ca9f28bb7d80';

-- Create a payment transaction for this quote if it doesn't exist
INSERT INTO payment_transactions (
  quote_id,
  client_id,
  organization_id,
  amount,
  currency,
  payment_method,
  status,
  metadata
)
SELECT 
  q.id,
  q.client_id,
  q.organization_id,
  GREATEST(q.premium, 1000000), -- Ensure minimum amount
  'NGN',
  'bank_transfer',
  'pending',
  '{"test_created": true, "created_by": "migration"}'::jsonb
FROM quotes q
WHERE q.id = '1bf66a89-f232-4ebc-b4e2-ca9f28bb7d80'
AND NOT EXISTS (
  SELECT 1 FROM payment_transactions pt 
  WHERE pt.quote_id = q.id
);