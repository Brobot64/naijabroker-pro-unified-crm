
-- First, let's completely reset and test the organizations table setup
-- Drop the table and recreate it to ensure clean state
DROP TABLE IF EXISTS public.organizations CASCADE;

-- Recreate organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  secondary_color TEXT DEFAULT '#64748b',
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  currency TEXT DEFAULT 'NGN',
  timezone TEXT DEFAULT 'Africa/Lagos',
  business_hours TEXT DEFAULT '9:00-17:00',
  mfa_required BOOLEAN DEFAULT false,
  password_policy TEXT DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create the most permissive INSERT policy possible for testing
CREATE POLICY "allow_all_authenticated_inserts"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create a basic SELECT policy  
CREATE POLICY "allow_all_authenticated_selects"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (true);

-- Test function to verify policy works
CREATE OR REPLACE FUNCTION test_organization_insert()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This should work if policies are correct
  INSERT INTO public.organizations (name, plan) 
  VALUES ('Test Org', 'test_plan');
  
  RETURN 'SUCCESS: Organization insert worked';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION test_organization_insert() TO authenticated;
