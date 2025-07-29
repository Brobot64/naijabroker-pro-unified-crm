-- Add the missing claim workflow functions

-- Function to auto-assign claims based on rules
CREATE OR REPLACE FUNCTION public.auto_assign_claim(
  _claim_id uuid,
  _organization_id uuid
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  assigned_user_id uuid;
  claim_type_val text;
BEGIN
  -- Get claim type
  SELECT claim_type INTO claim_type_val
  FROM public.claims
  WHERE id = _claim_id;
  
  -- Simple round-robin assignment by claim type
  -- In production, this could be more sophisticated (workload, expertise, etc.)
  SELECT ur.user_id INTO assigned_user_id
  FROM public.user_roles ur
  WHERE ur.organization_id = _organization_id 
    AND ur.role::text IN ('Agent', 'Underwriter')
  ORDER BY 
    -- Prefer agents for initial assignment
    CASE WHEN ur.role::text = 'Agent' THEN 1 ELSE 2 END,
    -- Simple rotation based on user_id
    ur.user_id
  LIMIT 1;
  
  -- Update claim with assigned user
  IF assigned_user_id IS NOT NULL THEN
    UPDATE public.claims 
    SET assigned_adjuster = assigned_user_id,
        updated_at = now()
    WHERE id = _claim_id;
  END IF;
  
  RETURN assigned_user_id;
END;
$function$;

-- Function to generate claim numbers
CREATE OR REPLACE FUNCTION public.generate_claim_number(_organization_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  org_prefix text;
  claim_number integer;
  new_claim_number text;
BEGIN
  -- Get organization name for prefix (first 3 characters, uppercase)
  SELECT UPPER(LEFT(name, 3)) INTO org_prefix 
  FROM public.organizations 
  WHERE id = _organization_id;
  
  -- Get next sequence number for this organization
  SELECT COALESCE(MAX(CAST(SUBSTRING(claim_number FROM 5) AS integer)), 0) + 1 
  INTO claim_number 
  FROM public.claims 
  WHERE organization_id = _organization_id 
    AND claim_number ~ ('^' || org_prefix || 'C[0-9]+$');
  
  -- Format as ORGC0001, ORGC0002, etc.
  new_claim_number := org_prefix || 'C' || LPAD(claim_number::text, 4, '0');
  
  RETURN new_claim_number;
END;
$function$;