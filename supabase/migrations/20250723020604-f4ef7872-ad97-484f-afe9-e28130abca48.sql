-- Clean up duplicate payment transactions
-- Keep only the most recent transaction per quote and delete duplicates

DO $$
DECLARE
    quote_rec RECORD;
    transaction_rec RECORD;
    keep_count INTEGER;
    delete_count INTEGER := 0;
BEGIN
    -- Loop through quotes that have multiple payment transactions
    FOR quote_rec IN 
        SELECT quote_id, COUNT(*) as transaction_count
        FROM payment_transactions 
        GROUP BY quote_id 
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'Quote % has % payment transactions', quote_rec.quote_id, quote_rec.transaction_count;
        
        -- Keep only the most recent transaction, delete the rest
        DELETE FROM payment_transactions 
        WHERE quote_id = quote_rec.quote_id
        AND id NOT IN (
            SELECT id 
            FROM payment_transactions 
            WHERE quote_id = quote_rec.quote_id 
            ORDER BY created_at DESC 
            LIMIT 1
        );
        
        GET DIAGNOSTICS keep_count = ROW_COUNT;
        delete_count := delete_count + keep_count;
        
        RAISE NOTICE 'Deleted % duplicate transactions for quote %', keep_count, quote_rec.quote_id;
    END LOOP;
    
    RAISE NOTICE 'Total duplicate payment transactions deleted: %', delete_count;
END $$;