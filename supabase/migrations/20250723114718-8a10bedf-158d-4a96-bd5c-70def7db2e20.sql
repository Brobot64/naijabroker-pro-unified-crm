-- Create function to safely update quotes from client portal (unauthenticated)
CREATE OR REPLACE FUNCTION public.update_quote_from_client_portal(
    portal_token_param text,
    new_status quote_status DEFAULT NULL,
    new_workflow_stage text DEFAULT NULL,
    new_payment_status text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    portal_link_record client_portal_links%ROWTYPE;
    quote_record quotes%ROWTYPE;
    update_result jsonb;
BEGIN
    -- Validate portal token and get link details
    SELECT * INTO portal_link_record 
    FROM client_portal_links 
    WHERE token = portal_token_param 
    AND expires_at > now() 
    AND is_used = false;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid or expired portal token'
        );
    END IF;
    
    -- Get current quote
    SELECT * INTO quote_record 
    FROM quotes 
    WHERE id = portal_link_record.quote_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Quote not found'
        );
    END IF;
    
    -- Perform the update with provided values
    UPDATE quotes 
    SET 
        status = COALESCE(new_status, status),
        workflow_stage = COALESCE(new_workflow_stage, workflow_stage),
        payment_status = COALESCE(new_payment_status, payment_status),
        updated_at = now()
    WHERE id = portal_link_record.quote_id;
    
    -- Log the action in audit trail
    INSERT INTO quote_audit_trail (
        organization_id,
        quote_id,
        action,
        stage,
        details,
        created_at
    ) VALUES (
        portal_link_record.organization_id,
        portal_link_record.quote_id,
        'client_portal_update',
        COALESCE(new_workflow_stage, quote_record.workflow_stage),
        jsonb_build_object(
            'portal_token_used', portal_token_param,
            'old_status', quote_record.status,
            'new_status', COALESCE(new_status, quote_record.status),
            'old_workflow_stage', quote_record.workflow_stage,
            'new_workflow_stage', COALESCE(new_workflow_stage, quote_record.workflow_stage),
            'old_payment_status', quote_record.payment_status,
            'new_payment_status', COALESCE(new_payment_status, quote_record.payment_status)
        ),
        now()
    );
    
    update_result := jsonb_build_object(
        'success', true,
        'quote_id', portal_link_record.quote_id,
        'updated_fields', jsonb_build_object(
            'status', COALESCE(new_status, quote_record.status),
            'workflow_stage', COALESCE(new_workflow_stage, quote_record.workflow_stage),
            'payment_status', COALESCE(new_payment_status, quote_record.payment_status)
        )
    );
    
    RETURN update_result;
END;
$$;

-- Create enhanced auto-transition function with comprehensive workflow logic
CREATE OR REPLACE FUNCTION public.auto_transition_quote_workflow(quote_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    quote_record quotes%ROWTYPE;
    result jsonb;
    portal_link_exists boolean;
    payment_transaction_exists boolean;
    evaluated_quotes_exist boolean;
BEGIN
    -- Get current quote state
    SELECT * INTO quote_record FROM quotes WHERE id = quote_id_param;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Quote not found'
        );
    END IF;
    
    -- Check for existing portal links
    SELECT EXISTS(
        SELECT 1 FROM client_portal_links 
        WHERE quote_id = quote_id_param AND is_used = false
    ) INTO portal_link_exists;
    
    -- Check for existing payment transactions
    SELECT EXISTS(
        SELECT 1 FROM payment_transactions 
        WHERE quote_id = quote_id_param
    ) INTO payment_transaction_exists;
    
    -- Check for evaluated quotes with responses
    SELECT EXISTS(
        SELECT 1 FROM evaluated_quotes 
        WHERE quote_id = quote_id_param AND response_received = true
    ) INTO evaluated_quotes_exist;
    
    result := jsonb_build_object(
        'quote_id', quote_id_param,
        'current_stage', quote_record.workflow_stage,
        'current_status', quote_record.status,
        'transitions_performed', jsonb_build_array()
    );
    
    -- Auto-transition logic based on current stage and conditions
    CASE quote_record.workflow_stage
        WHEN 'quote-evaluation' THEN
            -- Auto-transition to client-selection if evaluated quotes exist
            IF evaluated_quotes_exist THEN
                UPDATE quotes 
                SET 
                    workflow_stage = 'client-selection',
                    status = 'sent',
                    updated_at = now()
                WHERE id = quote_id_param;
                
                result := jsonb_set(
                    result, 
                    '{transitions_performed}', 
                    (result->'transitions_performed') || jsonb_build_object(
                        'from', 'quote-evaluation',
                        'to', 'client-selection',
                        'reason', 'evaluated_quotes_available'
                    )
                );
            END IF;
            
        WHEN 'client-selection' THEN
            -- Auto-transition to client_approved if quote status is accepted
            IF quote_record.status = 'accepted' THEN
                UPDATE quotes 
                SET 
                    workflow_stage = 'client_approved',
                    payment_status = COALESCE(quote_record.payment_status, 'pending'),
                    updated_at = now()
                WHERE id = quote_id_param;
                
                result := jsonb_set(
                    result, 
                    '{transitions_performed}', 
                    (result->'transitions_performed') || jsonb_build_object(
                        'from', 'client-selection',
                        'to', 'client_approved',
                        'reason', 'quote_accepted_by_client'
                    )
                );
            END IF;
            
        WHEN 'client_approved' THEN
            -- Auto-transition to payment-processing if payment transaction exists
            IF payment_transaction_exists THEN
                UPDATE quotes 
                SET 
                    workflow_stage = 'payment-processing',
                    updated_at = now()
                WHERE id = quote_id_param;
                
                result := jsonb_set(
                    result, 
                    '{transitions_performed}', 
                    (result->'transitions_performed') || jsonb_build_object(
                        'from', 'client_approved',
                        'to', 'payment-processing',
                        'reason', 'payment_transaction_initiated'
                    )
                );
            END IF;
            
        WHEN 'payment-processing' THEN
            -- Auto-transition to contract-generation if payment is completed
            IF quote_record.payment_status = 'completed' THEN
                UPDATE quotes 
                SET 
                    workflow_stage = 'contract-generation',
                    updated_at = now()
                WHERE id = quote_id_param;
                
                result := jsonb_set(
                    result, 
                    '{transitions_performed}', 
                    (result->'transitions_performed') || jsonb_build_object(
                        'from', 'payment-processing',
                        'to', 'contract-generation',
                        'reason', 'payment_completed'
                    )
                );
            END IF;
            
        ELSE
            -- No auto-transitions for other stages
            NULL;
    END CASE;
    
    -- Add success indicator
    result := jsonb_set(result, '{success}', 'true');
    
    RETURN result;
END;
$$;