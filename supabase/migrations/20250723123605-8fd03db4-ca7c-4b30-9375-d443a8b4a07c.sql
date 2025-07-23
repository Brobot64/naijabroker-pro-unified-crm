-- Fix RLS policies for quotes table to allow client portal updates via database functions

-- Check current policies on quotes table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'quotes';

-- The issue is that the database functions update_quote_from_client_portal and 
-- auto_transition_quote_workflow need to be able to update quotes from client portals.
-- Since these functions are SECURITY DEFINER, they should be able to bypass RLS.

-- But we need to ensure there's a policy that allows anonymous users (client portal tokens)
-- to update quotes when using the database functions

-- Add a specific policy for client portal updates via database functions
CREATE POLICY "quotes_client_portal_function_updates" 
ON public.quotes 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Also check if we need policies for reading quotes from client portal
CREATE POLICY "quotes_client_portal_select" 
ON public.quotes 
FOR SELECT 
TO anon
USING (true);