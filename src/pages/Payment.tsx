import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, CreditCard, Upload, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  quote_id: string;
  client_id: string;
  organization_id: string;
  metadata: any;
}

export const Payment = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [organizationBanks, setOrganizationBanks] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('gateway');
  const [bankTransferDetails, setBankTransferDetails] = useState({
    transactionReference: '',
    accountName: '',
    bankName: '',
    notes: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const transactionId = searchParams.get('transaction');

  useEffect(() => {
    if (transactionId) {
      fetchTransaction();
    } else {
      toast({
        title: "Invalid Payment Link",
        description: "No transaction ID provided",
        variant: "destructive"
      });
      setLoading(false);
    }
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Transaction not found');
      }

      setTransaction(data);

      // Load client data using direct query to clients table
      console.log('=== CLIENT DATA LOADING DEBUG ===');
      console.log('Transaction data:', data);
      console.log('Client ID from transaction:', data.client_id);
      
      if (!data.client_id) {
        console.error('❌ No client_id found in transaction data');
        setClientData({ 
          client_code: 'MISSING_CLIENT_ID', 
          name: 'No Client ID in Transaction',
          email: '',
          client_type: 'company'
        });
      } else {
        console.log('✅ Client ID found, fetching client data...');
        
        const { data: clientInfo, error: clientError } = await supabase
          .from('clients')
          .select('client_code, name, email, client_type, organization_id')
          .eq('id', data.client_id)
          .maybeSingle();

        console.log('Client query result:', { clientInfo, clientError });

        if (clientError) {
          console.error('❌ Error fetching client data:', clientError);
          setClientData({ 
            client_code: 'DATABASE_ERROR', 
            name: 'Database Error',
            email: '',
            client_type: 'company'
          });
        } else if (!clientInfo) {
          console.error('❌ No client found with ID:', data.client_id);
          setClientData({ 
            client_code: 'CLIENT_NOT_FOUND', 
            name: 'Client Not Found',
            email: '',
            client_type: 'company'
          });
        } else if (clientInfo.client_code) {
          console.log('✅ Client data loaded successfully with client_code:', clientInfo.client_code);
          setClientData(clientInfo);
        } else {
          console.warn('⚠️ Client found but no client_code:', clientInfo);
          setClientData({ 
            client_code: 'EMPTY_CLIENT_CODE', 
            name: clientInfo?.name || 'Client Found',
            email: clientInfo?.email || '',
            client_type: clientInfo?.client_type || 'company'
          });
        }
      }

      // Load organization bank details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('bank_details')
        .eq('id', data.organization_id)
        .single();

      if (!orgError && orgData?.bank_details) {
        const banks = Array.isArray(orgData.bank_details) ? orgData.bank_details : [];
        setOrganizationBanks(banks);
      }

    } catch (error: any) {
      console.error('Error fetching transaction:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to load payment details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGatewayPayment = () => {
    // Simulate payment gateway integration
    toast({
      title: "Redirecting to Payment Gateway",
      description: "You will be redirected to complete your payment",
    });
    
    // In a real implementation, you would redirect to Paystack, Flutterwave, etc.
    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully",
      });
    }, 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File Uploaded",
        description: `${file.name} has been selected`,
      });
    }
  };

  const handleBankTransferSubmit = async () => {
    if (!uploadedFile) {
      toast({
        title: "Missing Information",
        description: "Please upload proof of payment",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Update transaction with bank transfer details
      const { error } = await supabase
        .from('payment_transactions')
        .update({
          payment_method: 'bank_transfer',
          status: 'pending_verification',
          metadata: {
            ...transaction?.metadata,
            bank_transfer_details: bankTransferDetails,
            proof_of_payment_file: uploadedFile.name,
            submitted_at: new Date().toISOString()
          }
        })
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Bank Transfer Submitted",
        description: "Your payment details have been submitted for verification",
      });

      // Refresh transaction data
      await fetchTransaction();
    } catch (error: any) {
      console.error('Error submitting bank transfer:', error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit payment details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-bold text-red-600 mb-2">Payment Not Found</h1>
            <p className="text-gray-600">Invalid payment link or transaction expired</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">
            Pay for your insurance premium securely
          </p>
        </div>

        {/* Payment Amount */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Amount Due:</span>
              <span className="text-2xl font-bold text-green-600">
                {transaction.currency} {transaction.amount.toLocaleString()}
              </span>
            </div>
            <div className="mt-2">
              <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                {transaction.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Choose Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="gateway"
                  name="paymentMethod"
                  value="gateway"
                  checked={paymentMethod === 'gateway'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-blue-600"
                />
                <Label htmlFor="gateway" className="flex items-center cursor-pointer">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay via Gateway (Paystack/Flutterwave)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="bank_transfer"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-blue-600"
                />
                <Label htmlFor="bank_transfer" className="flex items-center cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Bank Transfer
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Forms */}
        {paymentMethod === 'gateway' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pay with Card/Gateway</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                You will be redirected to our secure payment gateway to complete your transaction.
              </p>
              <Button 
                onClick={handleGatewayPayment}
                className="w-full"
                size="lg"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay via Gateway
              </Button>
            </CardContent>
          </Card>
        )}

        {paymentMethod === 'bank_transfer' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bank Transfer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bank Account Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Transfer to:</h4>
                {organizationBanks.length > 0 ? (
                  organizationBanks.map((bank, index) => (
                    <div key={index} className={`space-y-1 text-sm ${index > 0 ? 'mt-4 pt-4 border-t' : ''}`}>
                      {bank.is_default && <Badge className="mb-2">Preferred Account</Badge>}
                      <p><strong>Account Name:</strong> {bank.account_name}</p>
                      <p><strong>Account Number:</strong> {bank.account_number}</p>
                      <p><strong>Bank:</strong> {bank.bank_name}</p>
                      {bank.bank_code && <p><strong>Bank Code:</strong> {bank.bank_code}</p>}
                      <p><strong>Amount:</strong> {transaction.currency} {transaction.amount.toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="space-y-1 text-sm">
                    <p><strong>Account Name:</strong> NaijaBroker Pro Limited</p>
                    <p><strong>Account Number:</strong> 1234567890</p>
                    <p><strong>Bank:</strong> First Bank of Nigeria</p>
                    <p><strong>Amount:</strong> {transaction.currency} {transaction.amount.toLocaleString()}</p>
                  </div>
                )}
                
                {/* Client ID Reference - Always show */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm font-medium text-yellow-800">🚨 IMPORTANT: Payment Reference Required</div>
                  <div className="text-sm text-yellow-700">
                    {clientData && clientData.client_code && !['MISSING_CLIENT_ID', 'DATABASE_ERROR', 'EMPTY_CLIENT_CODE', 'CLIENT_NOT_FOUND'].includes(clientData.client_code) ? (
                      <>
                        <strong>MUST INCLUDE:</strong> Your Customer ID <strong className="text-yellow-900 bg-yellow-100 px-2 py-1 rounded">{clientData.client_code}</strong> in your bank transfer narration/description.
                        <br />
                        <span className="text-xs mt-1 block">This ensures quick identification and processing of your payment.</span>
                      </>
                    ) : (
                      <>
                        <strong>MUST INCLUDE:</strong> Your <strong className="text-yellow-900">Customer ID</strong> in your bank transfer narration/description.
                        <br />
                        <span className="text-xs mt-1 block">Your Customer ID has been sent to your email. Check your email or contact support if you need assistance.</span>
                        {clientData?.client_code && (
                          <div className="text-xs mt-1 text-red-600">Debug: {clientData.client_code}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Transfer Confirmation Form */}
              <div className="space-y-4">

                <div>
                  <Label htmlFor="proofUpload">Upload Proof of Payment *</Label>
                  <Input
                    id="proofUpload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload bank receipt, screenshot, or confirmation (PDF, JPG, PNG)
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information..."
                    value={bankTransferDetails.notes}
                    onChange={(e) => setBankTransferDetails(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleBankTransferSubmit}
                  disabled={loading || !uploadedFile}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Bank Transfer Details
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {transaction.status === 'completed' && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Payment Completed!
                </h3>
                <p className="text-green-600">
                  Your payment has been processed successfully. You will receive a confirmation email shortly.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Having issues with payment? Contact support for assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default Payment;