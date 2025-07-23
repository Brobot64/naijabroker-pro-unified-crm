
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, CheckCircle, Mail, Copy } from "lucide-react";
import { evaluatedQuotesService } from "@/services/evaluatedQuotesService";
import { supabase } from "@/integrations/supabase/client";

interface ClientSelectionProps {
  evaluatedQuotes: any[];
  clientData: any;
  onSelectionComplete: (selection: any) => void;
  onBack: () => void;
}

export const ClientSelection = ({ evaluatedQuotes, clientData, onSelectionComplete, onBack }: ClientSelectionProps) => {
  const { toast } = useToast();
  const [portalLinkGenerated, setPortalLinkGenerated] = useState(false);
  const [clientSelection, setClientSelection] = useState<any>(null);
  const [portalLink, setPortalLink] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [validQuotes, setValidQuotes] = useState<any[]>([]);
  const [quoteStatus, setQuoteStatus] = useState<any>(null);

  console.log("ClientSelection received evaluatedQuotes:", evaluatedQuotes);
  console.log("ClientSelection received clientData:", clientData);

  // Filter and set valid quotes on mount or when evaluatedQuotes change
  useEffect(() => {
    if (evaluatedQuotes && Array.isArray(evaluatedQuotes)) {
      const valid = evaluatedQuotes.filter(quote => 
        quote && 
        quote.insurer_name && 
        quote.premium_quoted > 0 && 
        quote.response_received
      );
      setValidQuotes(valid);
      console.log("Valid quotes for client selection:", valid);
    }
  }, [evaluatedQuotes]);

  // Check quote status to see if client has already made selection
  useEffect(() => {
    const checkQuoteStatus = async () => {
      if (validQuotes.length > 0) {
        try {
          const quoteId = validQuotes[0]?.quote_id || clientData?.quote_id;
          if (quoteId) {
            const { data: quote } = await supabase
              .from('quotes')
              .select('workflow_stage, payment_status, updated_at')
              .eq('id', quoteId)
              .single();
            
            if (quote) {
              setQuoteStatus(quote);
            }
          }
        } catch (error) {
          console.error('Error checking quote status:', error);
        }
      }
    };
    
    checkQuoteStatus();
  }, [validQuotes, clientData]);

  const generatePortalLink = async () => {
    if (!clientData || !validQuotes.length) {
      toast({
        title: "Error",
        description: "No client data or valid quotes available",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get the actual quote ID from the quotes
      const quoteId = validQuotes[0]?.quote_id || clientData.quote_id || '00ad54ee-4009-413a-a0bb-658a14ff41de';
      
      console.log('Generating portal link with:', {
        quoteId,
        clientId: clientData.id || 'temp-client-id',
        validQuotesCount: validQuotes.length,
        clientData: clientData
      });
      
      // Generate secure client portal link with token
      const { data, error } = await evaluatedQuotesService.generateClientPortalLink(
        quoteId,
        clientData.id || 'temp-client-id',
        validQuotes
      );

      if (error) {
        throw new Error(error.message || 'Failed to generate portal link');
      }

      setPortalLink(data.portalUrl);
      setPortalLinkGenerated(true);
      
      toast({
        title: "Portal Link Generated",
        description: `Secure link generated and sent to ${clientData.email || clientData.name}`,
      });

      // Send email notification
      await evaluatedQuotesService.sendEmailNotification(
        'client_portal_access',
        clientData.email || 'client@example.com',
        'Review Your Insurance Quotes',
        `Hello ${clientData.name || 'Valued Client'},\n\nYour insurance quotes are ready for review. Please click the link below to view and select your preferred option:\n\n${data.portalUrl}\n\nThis link will expire in 72 hours.\n\nBest regards,\nYour Insurance Broker`,
        {
          clientId: clientData.id,
          quoteCount: validQuotes.length,
          portalLinkId: data.portalLinkId
        }
      );

    } catch (error) {
      console.error('Error generating portal link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate portal link",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateClientSelection = async (quote: any) => {
    // Ensure the quote has required properties
    const processedQuote = {
      ...quote,
      id: quote.id || quote.insurer_id || `quote-${Date.now()}`,
      insurer_name: quote.insurer_name || 'Unknown Insurer',
      premium_quoted: Number(quote.premium_quoted) || 0,
      commission_split: Number(quote.commission_split) || 0,
      rating_score: Number(quote.rating_score) || 0,
      response_received: Boolean(quote.response_received),
      terms_conditions: quote.terms_conditions || '',
      exclusions: Array.isArray(quote.exclusions) ? quote.exclusions : [],
      coverage_limits: quote.coverage_limits || {},
      selected_at: new Date().toISOString()
    };
    
    try {
      // Use the actual current quote ID from the context
      const currentQuoteId = clientData?.quote_id || validQuotes[0]?.quote_id;
      
      console.log('🎯 Client selection - Starting workflow update:', {
        clientDataQuoteId: clientData?.quote_id,
        validQuotesQuoteId: validQuotes[0]?.quote_id,
        selectedQuoteId: currentQuoteId,
        selectedQuote: processedQuote.insurer_name
      });
      
      if (currentQuoteId) {
        console.log('🎯 Client selection completed - progressing workflow for quote:', currentQuoteId);
        
        // Import the new workflow transition hook
        const { useWorkflowTransition } = await import('@/hooks/useWorkflowTransition');
        
        // Use the new workflow transition system
        const { WorkflowSyncService } = await import('@/services/workflowSyncService');
        await WorkflowSyncService.progressWorkflow(
          currentQuoteId,
          'client_approved',
          'accepted',
          'pending'
        );
        
        console.log('✅ Workflow progression completed successfully');
        
        // Refresh the quote status to show updated state
        const { data: updatedQuote } = await supabase
          .from('quotes')
          .select('workflow_stage, status, payment_status, updated_at')
          .eq('id', currentQuoteId)
          .maybeSingle();
        
        if (updatedQuote) {
          console.log('📊 Quote status after progression:', updatedQuote);
          setQuoteStatus(updatedQuote);
        }
      }
    } catch (error) {
      console.error('❌ Error updating client selection:', error);
      toast({
        title: "Error",
        description: "Failed to record client selection",
        variant: "destructive"
      });
      return;
    }
    
    setClientSelection(processedQuote);
    onSelectionComplete(processedQuote);
    
    toast({
      title: "Client Selection Confirmed",
      description: `Selected ${processedQuote.insurer_name} with premium ₦${processedQuote.premium_quoted.toLocaleString()}`,
    });
  };

  const copyPortalLink = () => {
    if (portalLink) {
      navigator.clipboard.writeText(portalLink);
      toast({
        title: "Link Copied",
        description: "Portal link copied to clipboard",
      });
    }
  };

  // Handle case where evaluatedQuotes might be empty
  if (!validQuotes || validQuotes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold">Client Selection</h2>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              No evaluated quotes available for client selection. 
              {evaluatedQuotes && evaluatedQuotes.length > 0 
                ? " Please ensure quotes have been properly evaluated with valid premium amounts."
                : " Please complete the quote evaluation process first."
              }
            </p>
            <Button variant="outline" onClick={onBack} className="mt-4">
              Go Back to Quote Evaluation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Client Selection</h2>
        </div>
        {clientSelection && (
          <Button onClick={() => onSelectionComplete(clientSelection)}>
            Proceed to Payment
          </Button>
        )}
      </div>

      {/* Client Portal Link Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Client Portal Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Share Quotes with Client</h4>
            <p className="text-sm text-blue-600 mb-3">
              Generate a secure portal link for {clientData?.name || 'the client'} to review and select from {validQuotes.length} available quotes.
            </p>
            <div className="flex items-center gap-2 mb-3">
              <Button 
                variant="outline" 
                onClick={generatePortalLink}
                disabled={portalLinkGenerated || loading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {loading ? "Generating..." : portalLinkGenerated ? "Portal Link Generated" : "Generate Portal Link"}
              </Button>
              {portalLinkGenerated && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Mail className="h-3 w-3 mr-1" />
                    Sent to {clientData?.email || clientData?.name}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={copyPortalLink}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            {portalLink && (
              <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded mt-2 break-all">
                {portalLink}
              </div>
            )}
          </div>

          {portalLinkGenerated && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Portal Link Sent</span>
              </div>
              <p className="text-sm text-green-600">
                The client has been notified via email and can now access their personalized quote comparison portal.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Comparison for Client */}
      <Card>
        <CardHeader>
          <CardTitle>
            Available Quotes for Client Review ({validQuotes.length})
            {quoteStatus?.workflow_stage === 'client_approved' && (
              <Badge className="ml-2 bg-green-600">Client Selection Completed</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quoteStatus?.workflow_stage === 'client_approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Client Has Made Their Selection</span>
              </div>
              <p className="text-sm text-green-600 mb-2">
                The client has successfully selected their preferred quote and the workflow has advanced.
              </p>
              <div className="text-xs text-green-600">
                <strong>Status:</strong> {quoteStatus.payment_status || 'Payment Pending'} | 
                <strong> Last Updated:</strong> {new Date(quoteStatus.updated_at).toLocaleString()}
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={() => onSelectionComplete(clientSelection)}>
                  Proceed to Next Stage
                </Button>
              </div>
            </div>
          )}
          <div className="space-y-4">
            {validQuotes?.map((quote, index) => (
              <div key={quote.insurer_id || index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{quote.insurer_name}</h4>
                  {quoteStatus?.workflow_stage === 'client_approved' ? (
                    <Badge variant="outline" className="text-green-600">
                      Awaiting Next Stage
                    </Badge>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => simulateClientSelection(quote)}
                    >
                      Simulate Client Selection
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Annual Premium:</span>
                    <p className="font-semibold text-lg">₦{(quote.premium_quoted || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Commission Split:</span>
                    <p className="font-semibold">{quote.commission_split || 0}%</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Rating Score:</span>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary">{quote.rating_score || 0}/100</Badge>
                      {quote.evaluation_source && (
                        <Badge variant="outline" className="text-xs">
                          {quote.evaluation_source === 'ai' ? 'AI' : 'Manual'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Response:</span>
                    <Badge variant={quote.response_received ? "secondary" : "outline"}>
                      {quote.response_received ? "Received" : "Pending"}
                    </Badge>
                  </div>
                </div>
                
                {quote.terms_conditions && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-gray-600 text-sm">Terms & Conditions:</span>
                    <p className="text-sm mt-1">{quote.terms_conditions}</p>
                  </div>
                )}
                
                {quote.exclusions && quote.exclusions.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-gray-600 text-sm">Key Exclusions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {quote.exclusions.map((exclusion: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {exclusion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selection Status */}
      {clientSelection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Client Selection Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                Selected: {clientSelection.insurer_name}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Premium:</span>
                  <p className="font-semibold">₦{(clientSelection.premium_quoted || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-green-600">Commission Split:</span>
                  <p className="font-semibold">{clientSelection.commission_split}%</p>
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">
                Client can now proceed to payment processing.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
