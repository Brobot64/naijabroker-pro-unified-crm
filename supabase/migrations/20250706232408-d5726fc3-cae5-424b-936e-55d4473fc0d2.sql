-- Add bank details to organizations table for payment processing
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS bank_details jsonb DEFAULT '[]'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.organizations.bank_details IS 'Array of bank account details for payment processing. Format: [{"account_name": "string", "account_number": "string", "bank_name": "string", "bank_code": "string", "is_default": boolean}]';