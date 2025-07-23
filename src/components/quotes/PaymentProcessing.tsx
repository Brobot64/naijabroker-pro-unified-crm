import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, Clock, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentProcessingProps {
  quoteId: string;
  clientData: any;
  evaluatedQuotes: any[];
  selectedQuote?: any;
  onBack: () => void;
  onPaymentComplete?: (paymentData: any) => void;
}

export const PaymentProcessing = ({ quoteId, clientData, evaluatedQuotes, selectedQuote, onBack, onPaymentComplete }: PaymentProcessingProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentTransaction, setPaymentTransaction] = useState<any>(null);

  useEffect(() => {
    loadPaymentStatus();
  }, [quoteId]);

  const loadPaymentStatus = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading payment status for quote:', quoteId);
      
      // Get the most recent payment transaction for this quote
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error fetching payment transactions:', error);
        throw error;
      }

      console.log('📊 Payment transactions found:', data?.length || 0);
      
      if (data && data.length > 0) {
        const latestTransaction = data[0];
        console.log('💳 Latest payment transaction:', latestTransaction);
        setPaymentTransaction(latestTransaction);
        
        // Clean up duplicate transactions if more than one exists
        if (data.length > 1) {
          console.log(`⚠️ Found ${data.length} payment transactions, keeping latest`);
          const duplicateIds = data.slice(1).map(t => t.id);
          
          // Delete duplicates in background (don't await to avoid blocking UI)
          supabase
            .from('payment_transactions')
            .delete()
            .in('id', duplicateIds)
            .then(({ error: deleteError }) => {
              if (deleteError) {
                console.error('❌ Failed to clean up duplicate transactions:', deleteError);
              } else {
                console.log(`✅ Cleaned up ${duplicateIds.length} duplicate payment transactions`);
              }
            });
        }
      } else {
        console.log('🔍 No payment transaction found for quote');
        setPaymentTransaction(null);
      }
    } catch (error) {
      console.error('❌ Error loading payment status:', error);
      toast({
        title: "Error",
        description: "Failed to load payment status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'pending_verification': return 'bg-yellow-600';
      case 'failed': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending_verification': return <Clock className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment Processing</CardTitle>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Client:</strong> {clientData?.name}</div>
              <div><strong>Client ID:</strong> {clientData?.client_code}</div>
              <div><strong>Selected Insurer:</strong> {selectedQuote?.insurer_name || 'N/A'}</div>
              <div><strong>Total Premium:</strong> ₦{selectedQuote?.premium_quoted?.toLocaleString() || '0'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        {paymentTransaction && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getStatusColor(paymentTransaction.status)}>
                  {getStatusIcon(paymentTransaction.status)}
                  <span className="ml-1">{paymentTransaction.status.replace('_', ' ').toUpperCase()}</span>
                </Badge>
                <span className="text-sm text-gray-600">
                  Updated: {new Date(paymentTransaction.updated_at).toLocaleString()}
                </span>
              </div>

              {paymentTransaction.status === 'pending_verification' && (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    Bank transfer details submitted by client. Awaiting payment verification.
                  </p>
                </div>
              )}

              {paymentTransaction.status === 'completed' && (
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-sm text-green-800">
                    Payment confirmed! Policy processing can begin.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dynamic Status Updates */}
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Payment Status Updates</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Payment status updates automatically as client completes payment</li>
            <li>• You'll be notified when bank transfer is submitted for verification</li>
            <li>• Gateway payments are processed immediately</li>
            <li>• Use the refresh button to check for status changes</li>
          </ul>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadPaymentStatus}
            disabled={loading}
            className="mt-3"
          >
            {loading ? "Refreshing..." : "Refresh Status"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};