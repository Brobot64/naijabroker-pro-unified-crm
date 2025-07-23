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
      
      // Force refresh quote status first to ensure latest data
      const { QuoteStatusSync } = await import('@/utils/quoteStatusSync');
      await QuoteStatusSync.refreshQuoteStatus(quoteId);
      
      // Import the new payment transaction service
      const { PaymentTransactionService } = await import('@/services/paymentTransactionService');
      
      // Use the service to get payment transaction with cleanup
      const latestTransaction = await PaymentTransactionService.getByQuoteId(quoteId);
      
      if (latestTransaction) {
        console.log('💳 Payment transaction found:', latestTransaction.id);
        setPaymentTransaction(latestTransaction);
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

  const handleVerifyPayment = async () => {
    if (!paymentTransaction) return;
    
    setLoading(true);
    try {
      console.log('🔄 Verifying payment for transaction:', paymentTransaction.id);
      
      // Import the payment transaction service
      const { PaymentTransactionService } = await import('@/services/paymentTransactionService');
      
      // Update payment status to completed
      await PaymentTransactionService.updateStatus(
        paymentTransaction.id, 
        'completed',
        { verified_by: 'admin', verified_at: new Date().toISOString() }
      );
      
      // Force refresh quote status to ensure workflow progresses
      const { QuoteStatusSync } = await import('@/utils/quoteStatusSync');
      await QuoteStatusSync.refreshQuoteStatus(quoteId);
      
      // Reload payment status
      await loadPaymentStatus();
      
      toast({
        title: "Payment Verified",
        description: "Payment has been successfully verified and marked as completed"
      });
      
      // Trigger payment completion callback
      if (onPaymentComplete) {
        onPaymentComplete({ 
          transaction: paymentTransaction, 
          status: 'completed',
          verified_at: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      toast({
        title: "Error",
        description: "Failed to verify payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!paymentTransaction) return;
    
    setLoading(true);
    try {
      console.log('🔄 Rejecting payment for transaction:', paymentTransaction.id);
      
      // Import the payment transaction service
      const { PaymentTransactionService } = await import('@/services/paymentTransactionService');
      
      // Update payment status to failed
      await PaymentTransactionService.updateStatus(
        paymentTransaction.id, 
        'failed',
        { rejected_by: 'admin', rejected_at: new Date().toISOString() }
      );
      
      // Reload payment status
      await loadPaymentStatus();
      
      toast({
        title: "Payment Rejected",
        description: "Payment has been rejected. Client can submit new payment details.",
        variant: "destructive"
      });
      
    } catch (error) {
      console.error('❌ Error rejecting payment:', error);
      toast({
        title: "Error",
        description: "Failed to reject payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200 space-y-3">
                  <p className="text-sm text-yellow-800">
                    Bank transfer details submitted by client. Awaiting payment verification.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleVerifyPayment}
                      disabled={loading}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? "Verifying..." : "Verify Payment"}
                    </Button>
                    <Button 
                      onClick={handleRejectPayment}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {loading ? "Rejecting..." : "Reject Payment"}
                    </Button>
                  </div>
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