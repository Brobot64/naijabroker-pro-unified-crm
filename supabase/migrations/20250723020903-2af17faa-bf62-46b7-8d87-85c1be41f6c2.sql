-- Create a function to sync workflow status for quotes
CREATE OR REPLACE FUNCTION public.sync_quote_workflow_status(quote_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    quote_record quotes%ROWTYPE;
    expected_status quote_status;
    update_result jsonb;
BEGIN
    -- Get current quote state
    SELECT * INTO quote_record FROM quotes WHERE id = quote_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quote not found: %', quote_id_param;
    END IF;
    
    -- Determine expected status based on workflow stage
    expected_status := CASE quote_record.workflow_stage
        WHEN 'quote-drafting' THEN 'draft'::quote_status
        WHEN 'rfq-generation' THEN 'sent'::quote_status
        WHEN 'insurer-matching' THEN 'sent'::quote_status
        WHEN 'quote-evaluation' THEN 'sent'::quote_status
        WHEN 'client-selection' THEN 'sent'::quote_status
        WHEN 'client_approved' THEN 'accepted'::quote_status
        WHEN 'payment-processing' THEN 'accepted'::quote_status
        WHEN 'contract-generation' THEN 'accepted'::quote_status
        WHEN 'completed' THEN 'accepted'::quote_status
        ELSE quote_record.status
    END;
    
    -- Update status if it doesn't match expected
    IF quote_record.status != expected_status THEN
        UPDATE quotes 
        SET 
            status = expected_status,
            updated_at = now()
        WHERE id = quote_id_param;
        
        update_result := jsonb_build_object(
            'updated', true,
            'old_status', quote_record.status,
            'new_status', expected_status,
            'workflow_stage', quote_record.workflow_stage
        );
    ELSE
        update_result := jsonb_build_object(
            'updated', false,
            'status', quote_record.status,
            'workflow_stage', quote_record.workflow_stage,
            'message', 'Status already synchronized'
        );
    END IF;
    
    RETURN update_result;
END;
$$;