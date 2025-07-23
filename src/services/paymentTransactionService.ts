import { supabase } from '@/integrations/supabase/client';

export interface PaymentTransaction {
  id: string;
  organization_id: string;
  quote_id: string;
  client_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_provider?: string;
  provider_reference?: string;
  status: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

export class PaymentTransactionService {
  /**
   * Ensures a payment transaction exists for a quote
   */
  static async ensurePaymentTransaction(
    quoteId: string, 
    clientId?: string, 
    amount?: number,
    organizationId?: string
  ): Promise<PaymentTransaction | null> {
    try {
      console.log('💳 PaymentTransactionService: Ensuring payment transaction for quote:', quoteId);
      
      // First, check for existing transactions and clean up duplicates
      const { data: existingTransactions, error: checkError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: false });

      if (checkError) {
        console.error('❌ Error checking existing transactions:', checkError);
        throw checkError;
      }

      // Clean up duplicates if they exist
      if (existingTransactions && existingTransactions.length > 1) {
        console.log(`⚠️ Found ${existingTransactions.length} payment transactions, cleaning up duplicates`);
        const duplicateIds = existingTransactions.slice(1).map(t => t.id);
        
        const { error: deleteError } = await supabase
          .from('payment_transactions')
          .delete()
          .in('id', duplicateIds);
        
        if (deleteError) {
          console.error('❌ Failed to clean up duplicates:', deleteError);
        } else {
          console.log(`✅ Cleaned up ${duplicateIds.length} duplicate payment transactions`);
        }
      }

      // If we have an existing transaction, return it
      if (existingTransactions && existingTransactions.length > 0) {
        console.log('✅ Payment transaction already exists:', existingTransactions[0].id);
        return existingTransactions[0];
      }

      // Get quote details if missing parameters
      if (!clientId || !amount || !organizationId) {
        const { data: quote, error: quoteError } = await supabase
          .from('quotes')
          .select('client_id, premium, organization_id')
          .eq('id', quoteId)
          .maybeSingle();

        if (quoteError || !quote) {
          console.error('❌ Quote not found for payment transaction creation:', quoteError);
          throw new Error('Quote not found');
        }

        clientId = clientId || quote.client_id;
        amount = amount || quote.premium;
        organizationId = organizationId || quote.organization_id;
      }

      if (!clientId || !organizationId) {
        console.error('❌ Missing required data for payment transaction creation');
        throw new Error('Missing client ID or organization ID');
      }

      // Create new payment transaction
      console.log('📝 Creating new payment transaction with:', {
        quote_id: quoteId,
        client_id: clientId,
        amount,
        organization_id: organizationId
      });

      const { data: newTransaction, error: createError } = await supabase
        .from('payment_transactions')
        .insert({
          quote_id: quoteId,
          client_id: clientId,
          organization_id: organizationId,
          amount: amount || 0,
          currency: 'NGN',
          payment_method: 'bank_transfer',
          status: 'pending',
          metadata: {
            created_by: 'system',
            auto_created: true,
            created_at: new Date().toISOString()
          }
        })
        .select()
        .maybeSingle();

      if (createError) {
        console.error('❌ Failed to create payment transaction:', createError);
        throw createError;
      }

      console.log('✅ Payment transaction created successfully:', newTransaction.id);
      return newTransaction;

    } catch (error) {
      console.error('❌ PaymentTransactionService: Error ensuring payment transaction:', error);
      throw error;
    }
  }

  /**
   * Get payment transaction for a quote
   */
  static async getByQuoteId(quoteId: string): Promise<PaymentTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error fetching payment transaction:', error);
      throw error;
    }
  }

  /**
   * Update payment transaction status
   */
  static async updateStatus(
    transactionId: string, 
    status: string, 
    metadata?: any
  ): Promise<PaymentTransaction> {
    try {
      console.log('💳 Updating payment transaction status:', { transactionId, status });
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (metadata) {
        updateData.metadata = metadata;
      }

      if (status === 'completed') {
        updateData.paid_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('payment_transactions')
        .update(updateData)
        .eq('id', transactionId)
        .select()
        .maybeSingle();

      if (error) throw error;
      
      console.log('✅ Payment transaction status updated successfully');
      return data;
    } catch (error) {
      console.error('❌ Error updating payment transaction status:', error);
      throw error;
    }
  }

  /**
   * Create payment transaction for quote workflow
   */
  static async createForQuote(
    quoteId: string,
    clientId: string,
    organizationId: string,
    amount: number
  ): Promise<PaymentTransaction> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          quote_id: quoteId,
          client_id: clientId,
          organization_id: organizationId,
          amount,
          currency: 'NGN',
          payment_method: 'bank_transfer',
          status: 'pending',
          metadata: {
            created_by: 'workflow',
            workflow_created: true
          }
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error creating payment transaction:', error);
      throw error;
    }
  }
}