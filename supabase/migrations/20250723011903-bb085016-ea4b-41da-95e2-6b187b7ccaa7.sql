-- Fix RLS policy for anonymous payment transaction updates
-- This allows anonymous users to update payment transactions they can select

-- Drop the existing policies that might be conflicting
DROP POLICY IF EXISTS "payment_transactions_client_portal_insert" ON public.payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_client_portal_select" ON public.payment_transactions;

-- Create specific policies for client portal access
CREATE POLICY "payment_transactions_client_portal_insert" 
ON public.payment_transactions 
FOR INSERT 
TO anon
WITH CHECK (true);

CREATE POLICY "payment_transactions_client_portal_select" 
ON public.payment_transactions 
FOR SELECT 
TO anon
USING (true);

-- Add a policy for anonymous updates (for payment submissions)
CREATE POLICY "payment_transactions_client_portal_update" 
ON public.payment_transactions 
FOR UPDATE 
TO anon
USING (true)
WITH CHECK (true);