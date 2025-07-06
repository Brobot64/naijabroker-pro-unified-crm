import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Star, MessageCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EvaluatedQuote {
  id: string;
  insurer_name: string;
  premium_quoted: number;
  commission_split: number;
  terms_conditions: string;
  exclusions: string[];
  coverage_limits: any;
  rating_score: number;
  remarks: string;
  document_url: string;
}

export const ClientPortal = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<EvaluatedQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<EvaluatedQuote | null>(null);
  const [clientComments, setClientComments] = useState('');
  const [portalData, setPortalData] = useState<any>(null);
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      fetchPortalData();
    } else {
      toast({
        title: "Invalid Access",
        description: "Portal token is required",
        variant: "destructive"
      });
      setLoading(false);
    }
  }, [token]);

  const fetchPortalData = async () => {
    try {
      console.log('Fetching portal data for token:', token);
      
      // Get portal link data
      const { data: portalLink, error } = await supabase
        .from('client_portal_links')
        .select('*')
        .eq('token', token)
        .maybeSingle();

      console.log('Portal link query result:', { portalLink, error });

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!portalLink) {
        console.error('No portal link found for token:', token);
        throw new Error('Portal link not found');
      }

      // Check if expired
      const now = new Date();
      const expiresAt = new Date(portalLink.expires_at);
      console.log('Expiration check:', { now, expiresAt, expired: now > expiresAt });
      
      if (now > expiresAt) {
        throw new Error('Portal link has expired');
      }

      // Check if already used
      if (portalLink.is_used) {
        throw new Error('Portal link has already been used');
      }

      setPortalData(portalLink);
      setQuotes(Array.isArray(portalLink.evaluated_quotes_data) ? portalLink.evaluated_quotes_data as unknown as EvaluatedQuote[] : []);

      // Get client information
      const { data: client } = await supabase
        .from('clients')
        .select('name, email')
        .eq('id', portalLink.client_id)
        .maybeSingle();

      setPortalData(prev => ({ ...prev, client }));
    } catch (error: any) {
      console.error('Error fetching portal data:', error);
      toast({
        title: "Access Error",
        description: error.message || "Failed to load portal data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSelection = async (quote: EvaluatedQuote) => {
    if (selectedQuote?.id === quote.id) {
      setSelectedQuote(null);
      return;
    }

    setSelectedQuote(quote);
    toast({
      title: "Quote Selected",
      description: `You have selected the quote from ${quote.insurer_name}`,
    });
  };

  const handleSubmitSelection = async () => {
    if (!selectedQuote || !portalData) {
      toast({
        title: "No Selection",
        description: "Please select a quote before submitting",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Mark portal as used and update quote status
      await supabase
        .from('client_portal_links')
        .update({ is_used: true })
        .eq('id', portalData.id);

      // Update quote status to show client approval
      await supabase
        .from('quotes')
        .update({ 
          workflow_stage: 'client_approved',
          payment_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', portalData.quote_id);

      // Create payment transaction record
      const { data: paymentTransaction, error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
          organization_id: portalData.organization_id,
          quote_id: portalData.quote_id,
          client_id: portalData.client_id,
          amount: selectedQuote.premium_quoted,
          payment_method: 'pending_selection',
          status: 'pending',
          currency: 'NGN',
          metadata: {
            selected_quote_id: selectedQuote.id,
            selected_insurer: selectedQuote.insurer_name,
            selected_premium: selectedQuote.premium_quoted,
            client_comments: clientComments,
            selected_at: new Date().toISOString()
          } as any
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Generate payment link
      const { data: paymentLinkData, error: paymentLinkError } = await supabase.functions.invoke('generate-payment-link', {
        body: {
          transactionId: paymentTransaction.id,
          amount: selectedQuote.premium_quoted,
          currency: 'NGN',
          description: `Insurance Premium Payment - ${selectedQuote.insurer_name}`,
          clientEmail: portalData.client?.email,
          clientName: portalData.client?.name
        }
      });

      if (paymentLinkError) {
        console.error('Payment link generation error:', paymentLinkError);
      }

      // Send notifications
      const { data: organizationData } = await supabase
        .from('organizations')
        .select('email, name')
        .eq('id', portalData.organization_id)
        .single();

      const brokerEmail = organizationData?.email || 'broker@naijabrokerpro.com';

      // Notify broker
      await supabase.functions.invoke('send-email-notification', {
        body: {
          type: 'client_quote_selection',
          recipientEmail: brokerEmail,
          subject: 'Client Quote Selection Confirmation',
          message: `Client ${portalData.client?.name} has selected a quote from ${selectedQuote.insurer_name} with premium ₦${selectedQuote.premium_quoted.toLocaleString()}.\n\n${clientComments ? `Client comments: ${clientComments}\n\n` : ''}Payment link has been generated and sent to client.`,
          metadata: {
            clientId: portalData.client_id,
            quoteId: portalData.quote_id,
            selectedQuote: selectedQuote,
            clientComments,
            paymentTransactionId: paymentTransaction.id
          }
        }
      });

      // Send payment link to client
      if (paymentLinkData?.paymentUrl && portalData.client?.email) {
        await supabase.functions.invoke('send-email-notification', {
          body: {
            type: 'payment_link',
            recipientEmail: portalData.client.email,
            subject: 'Complete Your Insurance Payment',
            message: `Dear ${portalData.client.name},\n\nThank you for selecting your insurance quote from ${selectedQuote.insurer_name}.\n\nPremium Amount: ₦${selectedQuote.premium_quoted.toLocaleString()}\n\nPlease click the link below to complete your payment:\n${paymentLinkData.paymentUrl}\n\nThis payment link will expire in 24 hours.\n\nBest regards,\n${organizationData?.name || 'Your Insurance Broker'}`,
            metadata: {
              paymentTransactionId: paymentTransaction.id,
              paymentUrl: paymentLinkData.paymentUrl
            }
          }
        });
      }

      // Show success message with payment link
      if (paymentLinkData?.paymentUrl) {
        // Store payment URL for display
        setPortalData(prev => ({ ...prev, paymentUrl: paymentLinkData.paymentUrl }));
        
        toast({
          title: "Selection Confirmed!",
          description: "Payment link generated and sent to your email. You can also use the link below.",
          duration: 8000
        });
      } else {
        toast({
          title: "Selection Submitted",
          description: "Your quote selection has been submitted successfully. You will be contacted for payment processing.",
        });
      }

    } catch (error: any) {
      console.error('Error submitting selection:', error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit selection",
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
          <p>Loading your insurance quotes...</p>
        </div>
      </div>
    );
  }

  if (!portalData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-gray-600">Invalid or expired portal link</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance Quote Selection</h1>
          <p className="text-gray-600">
            Welcome {portalData.client?.name}! Please review and select your preferred insurance quote.
          </p>
        </div>

        {/* Quote Selection */}
        <div className="space-y-6">
          {quotes.map((quote, index) => (
            <Card 
              key={quote.id || index} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedQuote?.id === quote.id ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleQuoteSelection(quote)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{quote.insurer_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {selectedQuote?.id === quote.id && (
                      <Badge className="bg-blue-600">Selected</Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{quote.rating_score}/100</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-gray-600 text-sm">Annual Premium</span>
                    <p className="text-2xl font-bold text-green-600">₦{quote.premium_quoted.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Rating Score</span>
                    <p className="text-lg font-semibold">{quote.rating_score}/100</p>
                  </div>
                </div>

                {quote.terms_conditions && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
                    <p className="text-sm text-gray-600">{quote.terms_conditions}</p>
                  </div>
                )}

                {quote.exclusions && quote.exclusions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Key Exclusions</h4>
                    <div className="flex flex-wrap gap-1">
                      {quote.exclusions.map((exclusion, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {exclusion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {quote.document_url && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <a href={quote.document_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Policy Document
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comments Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any questions or special requirements? Let us know..."
              value={clientComments}
              onChange={(e) => setClientComments(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit Button & Payment Link */}
        <div className="mt-8 text-center">
          <Button 
            size="lg" 
            onClick={handleSubmitSelection}
            disabled={!selectedQuote || loading}
            className="px-8"
          >
            {loading ? (
              "Submitting..."
            ) : selectedQuote ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Selection & Proceed
              </>
            ) : (
              "Please Select a Quote"
            )}
          </Button>
          
          {selectedQuote && (
            <p className="text-sm text-gray-600 mt-2">
              You have selected {selectedQuote.insurer_name} with premium ₦{selectedQuote.premium_quoted.toLocaleString()}
            </p>
          )}

          {/* Payment Link Display */}
          {portalData?.paymentUrl && (
            <Card className="mt-6 bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">Selection Confirmed!</h3>
                </div>
                <p className="text-green-700 mb-4">
                  Your quote selection has been submitted. Complete your payment using the link below:
                </p>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <a href={portalData.paymentUrl} target="_blank" rel="noopener noreferrer">
                    Proceed to Payment
                  </a>
                </Button>
                <p className="text-sm text-green-600 mt-2">
                  Payment link also sent to your email address
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Having questions? Contact your insurance broker for assistance.</p>
          <p className="mt-1">This portal link will expire and cannot be reused after submission.</p>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;