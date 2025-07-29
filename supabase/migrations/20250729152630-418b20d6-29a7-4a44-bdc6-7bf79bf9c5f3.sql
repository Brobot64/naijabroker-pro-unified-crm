-- PHASE 1.1: Fix Database Function Security Issues
-- Add SET search_path = '' to all existing functions for security

-- Fix function: get_user_organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id(user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT organization_id FROM public.profiles WHERE id = user_id LIMIT 1;
$function$;

-- Fix function: test_organization_insert
CREATE OR REPLACE FUNCTION public.test_organization_insert()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- This should work if policies are correct
  INSERT INTO public.organizations (name, plan) 
  VALUES ('Test Org', 'test_plan');
  
  RETURN 'SUCCESS: Organization insert worked';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
END;
$function$;

-- Fix function: handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix function: generate_client_code (single parameter version)
CREATE OR REPLACE FUNCTION public.generate_client_code(org_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
    code_prefix text;
    code_number integer;
    new_code text;
BEGIN
    -- Get organization name for prefix (first 3 characters, uppercase)
    SELECT UPPER(LEFT(name, 3)) INTO code_prefix FROM public.organizations WHERE id = org_id;
    
    -- Get next sequence number for this organization
    SELECT COALESCE(MAX(CAST(SUBSTRING(client_code FROM 4) AS integer)), 0) + 1 
    INTO code_number 
    FROM public.clients 
    WHERE organization_id = org_id AND client_code ~ '^[A-Z]{3}[0-9]+$';
    
    -- Format as ORG0001, ORG0002, etc.
    new_code := code_prefix || LPAD(code_number::text, 4, '0');
    
    RETURN new_code;
END;
$function$;

-- Fix function: generate_client_code (two parameter version)
CREATE OR REPLACE FUNCTION public.generate_client_code(org_id uuid, client_type text DEFAULT 'company'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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

-- Fix function: get_user_organization
CREATE OR REPLACE FUNCTION public.get_user_organization(_user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT organization_id
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$function$;

-- Fix function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$function$;

-- Fix function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$function$;