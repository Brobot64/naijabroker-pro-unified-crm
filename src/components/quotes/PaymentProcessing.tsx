
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CreditCard, CheckCircle, ExternalLink, Upload, Building2 } from "lucide-react";

interface PaymentProcessingProps {
  selectedQuote: any;
  clientData: any;
  onPaymentComplete: (paymentData: any) => void;
  onBack: () => void;
}

export const PaymentProcessing = ({ selectedQuote, clientData, onPaymentComplete, onBack }: PaymentProcessingProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [paymentMethod, setPaymentMethod] = useState<'gateway' | 'bank_transfer' | 'cheque'>('gateway');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bankTransferDetails, setBankTransferDetails] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    transactionReference: '',
    notes: ''
  });

  // Safety check for selectedQuote
  if (!selectedQuote) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold">Payment Processing</h2>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">No quote selected for payment processing.</p>
            <Button variant="outline" onClick={onBack} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const handleBankTransferSubmission = () => {
    if (!bankTransferDetails.transactionReference || !uploadedFile) {
      alert('Please provide transaction reference and upload proof of payment');
      return;
    }
    
    setPaymentStatus('processing');
    // Simulate processing time
    setTimeout(() => {
      setPaymentStatus('completed');
      const paymentData = {
        id: `PAY-${Date.now()}`,
        amount: selectedQuote.premium_quoted || selectedQuote.premium || 0,
        method: paymentMethod,
        status: 'pending_verification',
        transactionId: bankTransferDetails.transactionReference,
        paidAt: new Date().toISOString(),
        quote: selectedQuote,
        client: clientData,
        bankTransferDetails,
        proofDocument: uploadedFile.name
      };
      onPaymentComplete(paymentData);
    }, 2000);
  };

  const simulateWebhookConfirmation = () => {
    setPaymentStatus('completed');
    const paymentData = {
      id: `PAY-${Date.now()}`,
      amount: selectedQuote.premium_quoted || selectedQuote.premium || 0,
      method: paymentMethod,
      status: 'completed',
      transactionId: `TXN-${Date.now()}`,
      paidAt: new Date().toISOString(),
      quote: selectedQuote,
      client: clientData
    };
    onPaymentComplete(paymentData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (images and PDFs only)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
      } else {
        alert('Please upload only images (JPG, PNG) or PDF files');
      }
    }
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
                <p className="font-semibold">{selectedQuote.insurer_name || 'Unknown Insurer'}</p>
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

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus === 'pending' && (
            <div className="space-y-4">
              {/* Payment Method Tabs */}
              <div className="flex gap-2 mb-4">
                <Button 
                  variant={paymentMethod === 'gateway' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('gateway')}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Gateway
                </Button>
                <Button 
                  variant={paymentMethod === 'bank_transfer' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Bank Transfer
                </Button>
              </div>

              {/* Gateway Payment */}
              {paymentMethod === 'gateway' && (
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

              {/* Bank Transfer Payment */}
              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Bank Details</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Account Name:</strong> Insurance Broker Ltd</p>
                      <p><strong>Account Number:</strong> 1234567890</p>
                      <p><strong>Bank:</strong> Access Bank</p>
                      <p><strong>Amount:</strong> ₦{(selectedQuote.premium_quoted || selectedQuote.premium || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountName">Account Name</Label>
                      <Input
                        id="accountName"
                        value={bankTransferDetails.accountName}
                        onChange={(e) => setBankTransferDetails({...bankTransferDetails, accountName: e.target.value})}
                        placeholder="Your account name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={bankTransferDetails.accountNumber}
                        onChange={(e) => setBankTransferDetails({...bankTransferDetails, accountNumber: e.target.value})}
                        placeholder="Your account number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={bankTransferDetails.bankName}
                        onChange={(e) => setBankTransferDetails({...bankTransferDetails, bankName: e.target.value})}
                        placeholder="Your bank name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="transactionRef">Transaction Reference</Label>
                      <Input
                        id="transactionRef"
                        value={bankTransferDetails.transactionReference}
                        onChange={(e) => setBankTransferDetails({...bankTransferDetails, transactionReference: e.target.value})}
                        placeholder="e.g. TRX123456789"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={bankTransferDetails.notes}
                      onChange={(e) => setBankTransferDetails({...bankTransferDetails, notes: e.target.value})}
                      placeholder="Any additional information"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="proofUpload">Upload Proof of Payment *</Label>
                    <div className="mt-2">
                      <Input
                        id="proofUpload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="mb-2"
                      />
                      {uploadedFile && (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <Upload className="h-4 w-4" />
                          {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)}MB)
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Upload image (JPG, PNG) or PDF proof of payment
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleBankTransferSubmission}
                    className="w-full flex items-center justify-center gap-2"
                    disabled={!bankTransferDetails.transactionReference || !uploadedFile}
                  >
                    <Upload className="h-4 w-4" />
                    Submit Bank Transfer Details
                  </Button>
                </div>
              )}
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
              <h3 className="font-semibold text-green-800 mb-2">
                {paymentMethod === 'bank_transfer' ? 'Bank Transfer Submitted!' : 'Payment Successful!'}
              </h3>
              <p className="text-green-600 mb-4">
                {paymentMethod === 'bank_transfer' 
                  ? `Bank transfer details for ₦${(selectedQuote.premium_quoted || selectedQuote.premium || 0).toLocaleString()} have been submitted for verification`
                  : `Payment of ₦${(selectedQuote.premium_quoted || selectedQuote.premium || 0).toLocaleString()} has been confirmed`
                }
              </p>
              <Badge variant="secondary" className="mb-4">
                {paymentMethod === 'bank_transfer' 
                  ? `Reference: ${bankTransferDetails.transactionReference}`
                  : `Transaction ID: TXN-${Date.now()}`
                }
              </Badge>
              <p className="text-sm text-green-600">
                {paymentMethod === 'bank_transfer' 
                  ? 'Your payment will be verified and processed within 24 hours'
                  : 'Interim contract will be generated automatically'
                }
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
