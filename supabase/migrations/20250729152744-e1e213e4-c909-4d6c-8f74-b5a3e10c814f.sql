-- PHASE 1.2: Claims-Specific Security Functions
-- Create security definer functions for claims workflow management

-- Function to check if user can update claim status
CREATE OR REPLACE FUNCTION public.can_update_claim_status(
  _user_id uuid, 
  _claim_id uuid, 
  _new_status claim_status
)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  user_org_id uuid;
  claim_org_id uuid;
  user_role_name app_role;
  current_status claim_status;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id 
  FROM public.profiles 
  WHERE id = _user_id;
  
  -- Get claim's organization and current status
  SELECT organization_id, status INTO claim_org_id, current_status
  FROM public.claims 
  WHERE id = _claim_id;
  
  -- Check if user belongs to same organization as claim
  IF user_org_id != claim_org_id THEN
    RETURN false;
  END IF;
  
  -- Get user's role
  SELECT role INTO user_role_name
  FROM public.user_roles 
  WHERE user_id = _user_id AND organization_id = user_org_id
  LIMIT 1;
  
  -- Status transition rules based on role
  CASE user_role_name
    WHEN 'SuperAdmin', 'BrokerAdmin' THEN
      -- Admins can make any status transition
      RETURN true;
    WHEN 'Underwriter' THEN
      -- Underwriters can approve/reject claims
      RETURN _new_status IN ('approved', 'rejected');
    WHEN 'Agent' THEN
      -- Agents can update to investigating/assessed
      RETURN _new_status IN ('investigating', 'assessed') AND current_status IN ('registered', 'investigating');
    ELSE
      -- Other roles cannot update status
      RETURN false;
  END CASE;
END;
$function$;

-- Function to get user's claims access level
CREATE OR REPLACE FUNCTION public.get_user_claims_access_level(
  _user_id uuid, 
  _organization_id uuid
)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  user_role_name app_role;
BEGIN
  -- Get user's role
  SELECT role INTO user_role_name
  FROM public.user_roles 
  WHERE user_id = _user_id AND organization_id = _organization_id
  LIMIT 1;
  
  -- Return access level based on role
  CASE user_role_name
    WHEN 'SuperAdmin', 'BrokerAdmin' THEN
      RETURN 'full';
    WHEN 'Underwriter' THEN
      RETURN 'approve';
    WHEN 'Agent' THEN
      RETURN 'manage';
    WHEN 'Compliance' THEN
      RETURN 'read';
    ELSE
      RETURN 'none';
  END CASE;
END;
$function$;

-- Function to validate claim workflow transitions
CREATE OR REPLACE FUNCTION public.validate_claim_workflow_transition(
  _claim_id uuid, 
  _from_status claim_status, 
  _to_status claim_status
)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Valid transition rules
  CASE _from_status
    WHEN 'registered' THEN
      RETURN _to_status IN ('investigating', 'rejected');
    WHEN 'investigating' THEN
      RETURN _to_status IN ('assessed', 'rejected');
    WHEN 'assessed' THEN
      RETURN _to_status IN ('approved', 'rejected');
    WHEN 'approved' THEN
      RETURN _to_status IN ('settled', 'rejected');
    WHEN 'settled' THEN
      RETURN _to_status = 'closed';
    WHEN 'rejected' THEN
      RETURN _to_status = 'closed';
    WHEN 'closed' THEN
      -- Closed claims cannot be reopened (only admins via direct update)
      RETURN false;
    ELSE
      RETURN false;
  END CASE;
END;
$function$;

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
    AND ur.role IN ('Agent', 'Underwriter')
  ORDER BY 
    -- Prefer agents for initial assignment
    CASE WHEN ur.role = 'Agent' THEN 1 ELSE 2 END,
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