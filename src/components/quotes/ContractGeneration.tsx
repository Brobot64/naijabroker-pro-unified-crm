
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Download, Send, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuoteAuditTrail } from "./QuoteAuditTrail";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PaymentTransactionService } from "@/services/paymentTransactionService";
import { evaluatedQuotesService } from "@/services/evaluatedQuotesService";
import { logWorkflowStage } from "@/utils/auditLogger";

console.log('🚀 ContractGeneration: Module loaded');

interface ContractGenerationProps {
  paymentData: any;
  selectedQuote: any;
  clientData: any;
  onContractsGenerated: (contracts: any) => void;
  onBack: () => void;
}

export const ContractGeneration = ({ paymentData, selectedQuote, clientData, onContractsGenerated, onBack }: ContractGenerationProps) => {
  console.log('🚀 ContractGeneration: Component rendering started');
  console.log('🔍 ContractGeneration: Props received:', {
    paymentData,
    selectedQuote,
    clientData,
    onContractsGenerated: !!onContractsGenerated,
    onBack: !!onBack
  });

  const [interimGenerated, setInterimGenerated] = useState(false);
  const [finalReceived, setFinalReceived] = useState(false);
  const [complianceChecked, setComplianceChecked] = useState(false);
  const [deviations, setDeviations] = useState<string[]>([]);
  const [isGeneratingInterim, setIsGeneratingInterim] = useState(false);
  const [isSimulatingFinal, setIsSimulatingFinal] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [evaluatedQuotes, setEvaluatedQuotes] = useState<any[]>([]);
  const [paymentTransaction, setPaymentTransaction] = useState<any>(null);
  const [insurerInfo, setInsurerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, organizationId } = useAuth();

  console.log('🔍 ContractGeneration: Auth state:', { user: !!user, organizationId });

  // Load contract data on component mount
  useEffect(() => {
    console.log('🚀 ContractGeneration: useEffect triggered');
    console.log('🔍 ContractGeneration: selectedQuote dependency:', selectedQuote);
    loadContractData();
  }, [selectedQuote]);

  const loadContractData = async () => {
    if (!selectedQuote?.id && !selectedQuote?.quote_id) {
      console.error('❌ ContractGeneration: No quote ID available. selectedQuote:', selectedQuote);
      setLoading(false);
      setError('No quote ID available');
      toast({
        title: "Error",
        description: "No quote ID available for contract generation",
        variant: "destructive"
      });
      return;
    }
    
    const quoteId = selectedQuote.id || selectedQuote.quote_id;
    console.log('🔍 ContractGeneration: Using quote ID:', quoteId);
    
    setLoading(true);
    try {
      // Load quote details with client information
      console.log('🔄 ContractGeneration: Fetching quote details...');
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('id', quoteId)
        .maybeSingle();

      if (quoteError) {
        console.error('❌ ContractGeneration: Quote fetch error:', quoteError);
        throw quoteError;
      }
      
      console.log('✅ ContractGeneration: Quote data fetched:', quoteData);
      setQuote(quoteData);

      // Load evaluated quotes to get insurer information
      console.log('🔄 ContractGeneration: Fetching evaluated quotes...');
      const { data: evalQuotes, error: evalError } = await evaluatedQuotesService.getEvaluatedQuotes(quoteId);
      console.log('✅ ContractGeneration: Evaluated quotes result:', { data: evalQuotes, error: evalError });

      if (evalError) {
        console.error('❌ ContractGeneration: Evaluated quotes fetch error:', evalError);
      }
      
      if (evalQuotes && evalQuotes.length > 0) {
        setEvaluatedQuotes(evalQuotes);
        console.log('🔍 ContractGeneration: Looking for selected insurer:', selectedQuote);
        
        // Find the selected insurer - try multiple matching strategies
        let selectedInsurer = null;
        
        // Strategy 1: Match by insurer name
        if (selectedQuote.insurer_name) {
          selectedInsurer = evalQuotes.find(eq => 
            eq.insurer_name?.toLowerCase() === selectedQuote.insurer_name?.toLowerCase()
          );
          console.log('🔍 ContractGeneration: Insurer match by name:', selectedInsurer);
        }
        
        // Strategy 2: If selectedQuote has more detailed info, use the first one or find by premium
        if (!selectedInsurer && selectedQuote.premium_quoted) {
          selectedInsurer = evalQuotes.find(eq => 
            eq.premium_quoted === selectedQuote.premium_quoted
          );
          console.log('🔍 ContractGeneration: Insurer match by premium:', selectedInsurer);
        }
        
        // Strategy 3: Use the first evaluated quote if nothing else matches
        if (!selectedInsurer && evalQuotes.length > 0) {
          selectedInsurer = evalQuotes[0];
          console.log('🔍 ContractGeneration: Using first evaluated quote:', selectedInsurer);
        }
        
        if (selectedInsurer) {
          setInsurerInfo(selectedInsurer);
          console.log('✅ ContractGeneration: Insurer info set:', selectedInsurer);
        } else {
          console.warn('⚠️ ContractGeneration: No matching insurer found');
        }
      } else {
        console.warn('⚠️ ContractGeneration: No evaluated quotes found');
      }

      // Load payment transaction
      console.log('🔄 ContractGeneration: Fetching payment transaction...');
      try {
        const transaction = await PaymentTransactionService.getByQuoteId(quoteId);
        console.log('✅ ContractGeneration: Payment transaction:', transaction);
        setPaymentTransaction(transaction);
      } catch (error) {
        console.warn('⚠️ ContractGeneration: No payment transaction found:', error);
      }

      // Check if contracts already exist
      if (quoteData?.interim_contract_url) {
        console.log('✅ ContractGeneration: Interim contract exists');
        setInterimGenerated(true);
      }
      if (quoteData?.final_contract_url) {
        console.log('✅ ContractGeneration: Final contract exists');
        setFinalReceived(true);
        setComplianceChecked(true);
      }

    } catch (error) {
      console.error('❌ ContractGeneration: Error loading contract data:', error);
      toast({
        title: "Error",
        description: "Failed to load contract data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInterimContract = async () => {
    if (!quote?.id || !organizationId) return;
    
    setIsGeneratingInterim(true);
    
    try {
      console.log('🔄 Generating interim contract...');
      
      // Generate document URL (in real implementation, this would call a document generation service)
      const documentUrl = `https://contracts.example.com/interim/${quote.id}_${Date.now()}.pdf`;
      
      // Update quote with interim contract URL
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          interim_contract_url: documentUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (updateError) throw updateError;

      // Log the action
      await logWorkflowStage(
        quote.id,
        organizationId,
        'contract-generation',
        'interim_contract_generated',
        {
          document_url: documentUrl,
          generated_at: new Date().toISOString(),
          client_name: clientData?.name || quote.client?.name,
          insurer_name: insurerInfo?.insurer_name || selectedQuote?.insurer_name
        },
        user?.id
      );
      
      const contracts = {
        interim: {
          id: `INT-${Date.now()}`,
          generatedAt: new Date().toISOString(),
          documentUrl,
          status: 'generated'
        }
      };
      
      setInterimGenerated(true);
      setQuote(prev => ({ ...prev, interim_contract_url: documentUrl }));
      onContractsGenerated(contracts);
      
      toast({
        title: "Success",
        description: "Interim contract generated and downloadable"
      });
      
      console.log('✅ Interim contract generated successfully');
      
    } catch (error) {
      console.error('❌ Error generating interim contract:', error);
      toast({
        title: "Error",
        description: "Failed to generate interim contract",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingInterim(false);
    }
  };

  const simulateFinalContract = async () => {
    if (!quote?.id || !organizationId) return;
    
    setIsSimulatingFinal(true);
    
    try {
      console.log('🔄 Simulating final contract receipt...');
      
      // Generate final contract URL
      const finalDocumentUrl = `https://contracts.example.com/final/${quote.id}_${Date.now()}.pdf`;
      
      // Update quote with final contract URL
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          final_contract_url: finalDocumentUrl,
          workflow_stage: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (updateError) throw updateError;

      // Log the action
      await logWorkflowStage(
        quote.id,
        organizationId,
        'contract-generation',
        'final_contract_received',
        {
          document_url: finalDocumentUrl,
          received_at: new Date().toISOString(),
          compliance_status: 'approved'
        },
        user?.id
      );
      
      setFinalReceived(true);
      
      // Simulate compliance check delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setComplianceChecked(true);
      // Simulate some minor deviations
      setDeviations(['Premium rate adjusted from 2.5% to 2.4%', 'Coverage period extended by 1 day']);
      
      setQuote(prev => ({ 
        ...prev, 
        final_contract_url: finalDocumentUrl,
        workflow_stage: 'completed'
      }));
      
      toast({
        title: "Success",
        description: "Final contract received and compliance check completed"
      });
      
      console.log('✅ Final contract simulation completed');
      
    } catch (error) {
      console.error('❌ Error simulating final contract:', error);
      toast({
        title: "Error",
        description: "Failed to simulate final contract receipt",
        variant: "destructive"
      });
    } finally {
      setIsSimulatingFinal(false);
    }
  };

  const downloadContract = (url: string, filename: string) => {
    // In a real implementation, this would download the actual file
    // For now, we'll simulate the download
    toast({
      title: "Download Started",
      description: `Downloading ${filename}...`
    });
    
    // Simulate file download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span>Loading contract data...</span>
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
          <h2 className="text-2xl font-bold">Contract Generation & Compliance</h2>
        </div>
      </div>

      {/* Contract Generation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Generation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Interim Contract */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Interim Contract
                </h4>
                {interimGenerated ? (
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Generated
                  </Badge>
                ) : (
                  <Button 
                    onClick={generateInterimContract}
                    disabled={isGeneratingInterim}
                  >
                    {isGeneratingInterim && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isGeneratingInterim ? "Generating..." : "Generate Interim Contract"}
                  </Button>
                )}
              </div>
              
              {interimGenerated && (
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-green-800">
                      Interim contract generated automatically using insurer template
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadContract(
                        quote?.interim_contract_url || '#',
                        `Interim_Contract_${quote?.quote_number || 'UNKNOWN'}.pdf`
                      )}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Email to Client
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Final Contract */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Final Policy Document
                </h4>
                {finalReceived ? (
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Received
                  </Badge>
                ) : (
                  <div className="flex gap-2">
                    <Badge variant="outline">Pending from Insurer</Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={simulateFinalContract}
                      disabled={isSimulatingFinal}
                    >
                      {isSimulatingFinal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {isSimulatingFinal ? "Processing..." : "Simulate Receipt"}
                    </Button>
                  </div>
                )}
              </div>
              
              {finalReceived && (
                <div className="space-y-3">
                 <div className="bg-blue-50 p-3 rounded">
                     <p className="text-sm text-blue-800">
                       Final policy document received from {insurerInfo?.insurer_name || selectedQuote?.insurer_name || 'Insurer'}
                     </p>
                     <div className="flex gap-2 mt-3">
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => downloadContract(
                           quote?.final_contract_url || '#',
                           `Final_Policy_${quote?.quote_number || 'UNKNOWN'}.pdf`
                         )}
                       >
                         <Download className="h-4 w-4 mr-2" />
                         Download Policy
                       </Button>
                     </div>
                  </div>
                  
                  {/* Compliance Check */}
                  {complianceChecked && (
                    <div className="border-t pt-3">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Compliance Check Complete
                      </h5>
                      
                      {deviations.length > 0 ? (
                        <div className="bg-yellow-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium text-yellow-800">Minor Deviations Found</span>
                          </div>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {deviations.map((deviation, index) => (
                              <li key={index}>• {deviation}</li>
                            ))}
                          </ul>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline">
                              Approve Deviations
                            </Button>
                            <Button size="sm" variant="outline">
                              Request Clarification
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm text-green-800">
                            No deviations found. Final contract matches original terms.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Details */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Client:</span>
              <p className="font-semibold">{
                clientData?.name || 
                quote?.client?.name || 
                quote?.client_name || 
                'Unknown Client'
              }</p>
            </div>
            <div>
              <span className="text-gray-600">Insurer:</span>
              <p className="font-semibold">{
                insurerInfo?.insurer_name || 
                selectedQuote?.insurer_name || 
                'Unknown Insurer'
              }</p>
            </div>
            <div>
              <span className="text-gray-600">Premium:</span>
              <p className="font-semibold">₦{(() => {
                const premium = insurerInfo?.premium_quoted || 
                             selectedQuote?.premium_quoted || 
                             selectedQuote?.premium || 
                             quote?.premium || 
                             0;
                console.log('🔍 ContractGeneration: Premium calculation:', {
                  insurerInfo_premium: insurerInfo?.premium_quoted,
                  selectedQuote_premium: selectedQuote?.premium_quoted,
                  selectedQuote_premium_alt: selectedQuote?.premium,
                  quote_premium: quote?.premium,
                  final_premium: premium
                });
                return Number(premium).toLocaleString();
              })()}</p>
            </div>
            <div>
              <span className="text-gray-600">Sum Insured:</span>
              <p className="font-semibold">₦{(() => {
                const sumInsured = quote?.sum_insured || selectedQuote?.sum_insured || 0;
                console.log('🔍 ContractGeneration: Sum Insured calculation:', {
                  quote_sum: quote?.sum_insured,
                  selectedQuote_sum: selectedQuote?.sum_insured,
                  final_sum: sumInsured
                });
                return Number(sumInsured).toLocaleString();
              })()}</p>
            </div>
            <div>
              <span className="text-gray-600">Payment Status:</span>
              <Badge variant={paymentTransaction?.status === 'completed' ? 'default' : 'secondary'}>
                {paymentTransaction?.status === 'completed' ? 'Paid' : 
                 paymentTransaction?.status?.replace('_', ' ').toUpperCase() || 
                 'Pending'}
              </Badge>
            </div>
            <div>
              <span className="text-gray-600">Transaction ID:</span>
              <p className="font-mono text-xs">{
                paymentTransaction?.id?.slice(0, 8) || 
                paymentTransaction?.provider_reference || 
                paymentData?.transactionId || 
                'N/A'
              }</p>
            </div>
            <div>
              <span className="text-gray-600">Quote Number:</span>
              <p className="font-semibold">{quote?.quote_number || selectedQuote?.quote_number || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Policy Type:</span>
              <p className="font-semibold">{quote?.policy_type || selectedQuote?.policy_type || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      {quote?.id && <QuoteAuditTrail quoteId={quote.id} />}

      {/* Completion Status */}
      {interimGenerated && finalReceived && complianceChecked && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Quote Process Complete!
              </h3>
              <p className="text-green-600">
                All contracts have been generated and compliance checks completed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
