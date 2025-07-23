-- Enhanced workflow automation function
CREATE OR REPLACE FUNCTION public.auto_progress_quote_workflow(quote_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    quote_record quotes%ROWTYPE;
    result jsonb;
    portal_link_count int;
    payment_transaction_count int;
BEGIN
    -- Get current quote state
    SELECT * INTO quote_record FROM quotes WHERE id = quote_id_param;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'error', true,
            'message', 'Quote not found'
        );
    END IF;
    
    result := jsonb_build_object(
        'quote_id', quote_id_param,
        'current_stage', quote_record.workflow_stage,
        'actions_taken', jsonb_build_array()
    );
    
    -- Auto-create client portal link for client-selection and later stages
    IF quote_record.workflow_stage IN ('client-selection', 'client_approved', 'payment-processing') THEN
        SELECT COUNT(*) INTO portal_link_count 
        FROM client_portal_links 
        WHERE quote_id = quote_id_param AND is_used = false;
        
        IF portal_link_count = 0 THEN
            -- Auto-create portal link would happen in application layer
            result := jsonb_set(
                result, 
                '{actions_taken}', 
                (result->'actions_taken') || '"portal_link_required"'
            );
        END IF;
    END IF;
    
    -- Auto-ensure payment transaction for payment stages
    IF quote_record.workflow_stage IN ('client_approved', 'payment-processing', 'contract-generation') THEN
        SELECT COUNT(*) INTO payment_transaction_count 
        FROM payment_transactions 
        WHERE quote_id = quote_id_param;
        
        IF payment_transaction_count = 0 THEN
            result := jsonb_set(
                result, 
                '{actions_taken}', 
                (result->'actions_taken') || '"payment_transaction_required"'
            );
        END IF;
    END IF;
    
    -- Auto-transition rules based on current stage
    CASE quote_record.workflow_stage
        WHEN 'quote-evaluation' THEN
            -- Check if we have evaluated quotes
            IF EXISTS (
                SELECT 1 FROM evaluated_quotes 
                WHERE quote_id = quote_id_param 
                AND response_received = true
            ) THEN
                UPDATE quotes 
                SET 
                    workflow_stage = 'client-selection',
                    status = 'sent',
                    updated_at = now()
                WHERE id = quote_id_param;
                
                result := jsonb_set(result, '{auto_transitioned}', 'true');
                result := jsonb_set(result, '{new_stage}', '"client-selection"');
            END IF;
            
        ELSE
            -- No auto-transition rules for other stages
            result := jsonb_set(result, '{auto_transitioned}', 'false');
    END CASE;
    
    RETURN result;
END;
$$;