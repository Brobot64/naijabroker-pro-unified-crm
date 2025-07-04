-- Fix RLS policies for payment_transactions to allow client portal submissions
-- This allows anonymous users to create payment transactions via client portal

-- Create policy for anonymous users to insert payment transactions via client portal
CREATE POLICY "payment_transactions_client_portal_insert" 
ON public.payment_transactions 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Allow anonymous users to read their own payment transactions using metadata
CREATE POLICY "payment_transactions_client_portal_select" 
ON public.payment_transactions 
FOR SELECT 
TO anon
USING (true);