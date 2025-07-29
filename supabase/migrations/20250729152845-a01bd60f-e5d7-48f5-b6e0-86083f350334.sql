-- Fix the security functions with correct data types
-- First, let's check what role types exist in the database

-- Function to check if user can update claim status (fixed)
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
  user_role_name text;
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
  SELECT role::text INTO user_role_name
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

-- Function to get user's claims access level (fixed)
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
  user_role_name text;
BEGIN
  -- Get user's role
  SELECT role::text INTO user_role_name
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