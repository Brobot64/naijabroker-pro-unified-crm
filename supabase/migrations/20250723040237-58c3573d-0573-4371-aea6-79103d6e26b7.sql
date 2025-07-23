-- Create missing client portal link for the correct test quote (QTE-202507-710)
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
  '[
    {
      "id": "2bfedebe-f6db-4c4e-82a1-d3ea6557a89a",
      "insurer_id": "2bfedebe-f6db-4c4e-82a1-d3ea6557a89a",
      "insurer_name": "Continental Reinsurance Plc",
      "insurer_email": "info@continentalre.com",
      "commission_split": 0,
      "premium_quoted": 1175228,
      "terms_conditions": "Standard insurance terms and conditions extracted from document",
      "exclusions": ["War risks", "Nuclear risks", "Cyber attacks"],
      "coverage_limits": {
        "Property Damage": "50,000,000",
        "Public Liability": "100,000,000",
        "Professional Indemnity": "25,000,000"
      },
      "rating_score": 87,
      "remarks": "",
      "response_received": true,
      "status": "dispatched",
      "source": "dispatched",
      "evaluation_source": "human",
      "annual_premium": 1175228,
      "commission_percentage": 0
    },
    {
      "id": "6467f3f4-c6d7-4d7d-9bf4-7fa1241b599d",
      "insurer_id": "6467f3f4-c6d7-4d7d-9bf4-7fa1241b599d",
      "insurer_name": "Leadway Assurance",
      "insurer_email": "quotes@leadway.com",
      "commission_split": 0,
      "premium_quoted": 1189879,
      "terms_conditions": "Standard insurance terms and conditions extracted from document",
      "exclusions": ["War risks", "Nuclear risks", "Cyber attacks"],
      "coverage_limits": {
        "Property Damage": "50,000,000",
        "Public Liability": "100,000,000",
        "Professional Indemnity": "25,000,000"
      },
      "rating_score": 47,
      "remarks": "",
      "response_received": true,
      "status": "dispatched",
      "source": "dispatched",
      "evaluation_source": "human",
      "annual_premium": 1189879,
      "commission_percentage": 0
    }
  ]'::jsonb
FROM quotes q
WHERE q.quote_number = 'QTE-202507-710'
AND NOT EXISTS (
  SELECT 1 FROM client_portal_links cpl 
  WHERE cpl.quote_id = q.id
);

-- Update the quote to client_approved workflow stage and accepted status
UPDATE quotes 
SET 
  workflow_stage = 'client_approved',
  status = 'accepted',
  payment_status = 'pending',
  updated_at = now()
WHERE quote_number = 'QTE-202507-710';