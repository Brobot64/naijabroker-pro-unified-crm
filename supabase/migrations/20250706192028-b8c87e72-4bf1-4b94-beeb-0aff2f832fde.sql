-- Add new fields to clients table for enhanced client management
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS client_type text DEFAULT 'company' CHECK (client_type IN ('company', 'individual')),
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_birthday date,
ADD COLUMN IF NOT EXISTS contact_anniversary date,
ADD COLUMN IF NOT EXISTS chairman_phone text,
ADD COLUMN IF NOT EXISTS chairman_email text, 
ADD COLUMN IF NOT EXISTS chairman_birthday date,
ADD COLUMN IF NOT EXISTS md_phone text,
ADD COLUMN IF NOT EXISTS md_email text,
ADD COLUMN IF NOT EXISTS md_birthday date,
ADD COLUMN IF NOT EXISTS head_of_finance_phone text,
ADD COLUMN IF NOT EXISTS head_of_finance_email text,
ADD COLUMN IF NOT EXISTS head_of_finance_birthday date;

-- Update the client code generation function to support company/individual prefixes
CREATE OR REPLACE FUNCTION public.generate_client_code(org_id uuid, client_type text DEFAULT 'company')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    code_prefix text;
    type_suffix text;
    code_number integer;
    new_code text;
BEGIN
    -- Get organization name for prefix (first 3 characters, uppercase)
    SELECT UPPER(LEFT(name, 3)) INTO code_prefix FROM public.organizations WHERE id = org_id;
    
    -- Set type suffix based on client type
    type_suffix := CASE 
        WHEN client_type = 'individual' THEN 'P'
        ELSE 'C'
    END;
    
    -- Get next sequence number for this organization and type
    SELECT COALESCE(MAX(CAST(SUBSTRING(client_code FROM 5 FOR 7) AS integer)), 0) + 1 
    INTO code_number 
    FROM public.clients 
    WHERE organization_id = org_id 
    AND client_code ~ ('^' || code_prefix || '[CP][0-9]{7}$')
    AND SUBSTRING(client_code FROM 4 FOR 1) = type_suffix;
    
    -- Format as ORG + C/P + 0000001, ORG + C/P + 0000002, etc.
    new_code := code_prefix || type_suffix || LPAD(code_number::text, 7, '0');
    
    RETURN new_code;
END;
$function$;