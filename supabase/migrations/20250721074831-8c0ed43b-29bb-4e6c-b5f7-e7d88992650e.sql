-- Create RLS policy to allow anonymous access to client data for valid payment transactions
-- This allows the payment page to fetch client information when a valid payment transaction exists

CREATE POLICY "clients_payment_transaction_access" 
ON public.clients 
FOR SELECT 
TO anon
USING (
  EXISTS (
    SELECT 1 
    FROM public.payment_transactions pt 
    WHERE pt.client_id = clients.id
  )
);