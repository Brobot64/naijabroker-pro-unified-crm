
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, CheckCircle, ExternalLink } from "lucide-react";

interface PaymentProcessingProps {
  selectedQuote: any;
  clientData: any;
  onPaymentComplete: (paymentData: any) => void;
  onBack: () => void;
}

export const PaymentProcessing = ({ selectedQuote, clientData, onPaymentComplete, onBack }: PaymentProcessingProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [paymentMethod, setPaymentMethod] = useState<'gateway' | 'bank_transfer' | 'cheque'>('gateway');

  const handlePaymentGateway = () => {
    setPaymentStatus('processing');
    
    // Simulate payment gateway redirect
    setTimeout(() => {
      setPaymentStatus('completed');
      const paymentData = {
        id: `PAY-${Date.now()}`,
                amount: selectedQuote.premium_quoted || selectedQuote.premium,
        method: paymentMethod,
        status: 'completed',
        transactionId: `TXN-${Date.now()}`,
        paidAt: new Date().toISOString(),
        quote: selectedQuote,
        client: clientData
      };
      onPaymentComplete(paymentData);
    }, 3000);
  };

  const simulateWebhookConfirmation = () => {
    setPaymentStatus('completed');
    const paymentData = {
      id: `PAY-${Date.now()}`,
      amount: selectedQuote.premium,
      method: paymentMethod,
      status: 'completed',
      transactionId: `TXN-${Date.now()}`,
      paidAt: new Date().toISOString(),
      quote: selectedQuote,
      client: clientData
    };
    onPaymentComplete(paymentData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Payment Processing</h2>
        </div>
        {paymentStatus === 'completed' && (
          <Button onClick={() => onPaymentComplete({ status: 'confirmed' })}>
            Continue to Contract Generation
          </Button>
        )}
      </div>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Client:</span>
                <p className="font-semibold">{clientData.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Insurer:</span>
                <p className="font-semibold">{selectedQuote.insurerName}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg">
                <span>Total Premium:</span>
                <span className="font-bold">₦{(selectedQuote.premium_quoted || selectedQuote.premium || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus === 'pending' && (
            <div className="space-y-3">
              <Button 
                onClick={handlePaymentGateway}
                className="w-full flex items-center justify-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Pay via Gateway (Paystack/Flutterwave)
              </Button>
              
              <Button 
                variant="outline" 
                onClick={simulateWebhookConfirmation}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Simulate Webhook Confirmation
              </Button>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing payment...</p>
              <p className="text-sm text-gray-500">Please wait while we confirm your payment</p>
            </div>
          )}

          {paymentStatus === 'completed' && (
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-green-800 mb-2">Payment Successful!</h3>
              <p className="text-green-600 mb-4">
                Payment of ₦{selectedQuote.premium.toLocaleString()} has been confirmed
              </p>
              <Badge variant="secondary" className="mb-4">
                Transaction ID: TXN-{Date.now()}
              </Badge>
              <p className="text-sm text-green-600">
                Interim contract will be generated automatically
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Status Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${paymentStatus !== 'pending' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={paymentStatus !== 'pending' ? 'text-green-600' : 'text-gray-500'}>
                Payment Initiated
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${paymentStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={paymentStatus === 'completed' ? 'text-green-600' : 'text-gray-500'}>
                Payment Confirmed
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="text-gray-500">Contract Generation</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
