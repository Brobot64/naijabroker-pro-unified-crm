
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

interface ContractGenerationProps {
  paymentData: any;
  selectedQuote: any;
  clientData: any;
  onContractsGenerated: (contracts: any) => void;
  onBack: () => void;
}

export const ContractGeneration = ({ paymentData, selectedQuote, clientData, onContractsGenerated, onBack }: ContractGenerationProps) => {

  const [interimGenerated, setInterimGenerated] = useState(false);
  const [finalReceived, setFinalReceived] = useState(false);
  const [complianceChecked, setComplianceChecked] = useState(false);
  const [deviations, setDeviations] = useState<string[]>([]);
  const [isGeneratingInterim, setIsGeneratingInterim] = useState(false);
  const [isSimulatingFinal, setIsSimulatingFinal] = useState(false);
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [evaluatedQuotes, setEvaluatedQuotes] = useState<any[]>([]);
  const [paymentTransaction, setPaymentTransaction] = useState<any>(null);
  const [insurerInfo, setInsurerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, organizationId } = useAuth();

  // Load contract data on component mount
  useEffect(() => {
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
    
    setLoading(true);
    try {
      console.log('🔄 ContractGeneration: Loading quote data for ID:', quoteId);
      
      // Load quote details with client information
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
      
      console.log('✅ ContractGeneration: Quote data loaded:', quoteData);
      setQuote(quoteData);

      // Load evaluated quotes to get insurer information
      const { data: evalQuotes, error: evalError } = await evaluatedQuotesService.getEvaluatedQuotes(quoteId);

      if (evalError) {
        console.error('❌ ContractGeneration: Evaluated quotes fetch error:', evalError);
      }
      
      if (evalQuotes && evalQuotes.length > 0) {
        setEvaluatedQuotes(evalQuotes);
        
        // Find the selected insurer - try multiple matching strategies
        let selectedInsurer = null;
        
        // Strategy 1: Match by insurer name
        if (selectedQuote.insurer_name) {
          selectedInsurer = evalQuotes.find(eq => 
            eq.insurer_name?.toLowerCase() === selectedQuote.insurer_name?.toLowerCase()
          );
        }
        
        // Strategy 2: If selectedQuote has more detailed info, use the first one or find by premium
        if (!selectedInsurer && selectedQuote.premium_quoted) {
          selectedInsurer = evalQuotes.find(eq => 
            eq.premium_quoted === selectedQuote.premium_quoted
          );
        }
        
        // Strategy 3: Use the first evaluated quote if nothing else matches
        if (!selectedInsurer && evalQuotes.length > 0) {
          selectedInsurer = evalQuotes[0];
        }
        
        if (selectedInsurer) {
          setInsurerInfo(selectedInsurer);
        }
      }

      // Load payment transaction
      try {
        const transaction = await PaymentTransactionService.getByQuoteId(quoteId);
        setPaymentTransaction(transaction);
      } catch (error) {
        console.warn('⚠️ ContractGeneration: No payment transaction found:', error);
      }

      // Check if contracts already exist
      if (quoteData?.interim_contract_url) {
        setInterimGenerated(true);
      }
      if (quoteData?.final_contract_url) {
        setFinalReceived(true);
        setComplianceChecked(true);
      }

    } catch (error) {
      console.error('❌ ContractGeneration: Error loading contract data:', error);
      setError('Failed to load contract data');
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
      // Generate document URL (in real implementation, this would call a document generation service)
      const documentUrl = `https://contracts.example.com/interim/${quote.id}_${Date.now()}.pdf`;
      
      // Perform atomic database update with transaction-like behavior
      const { data: updatedQuote, error: updateError } = await supabase
        .from('quotes')
        .update({
          interim_contract_url: documentUrl,
          workflow_stage: 'completed',
          payment_status: 'completed',
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', quote.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Database update failed:', updateError);
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      if (!updatedQuote) {
        throw new Error('Quote update returned no data - possible concurrency issue');
      }

      // Verify the update was successful by checking returned data
      if (updatedQuote.workflow_stage !== 'completed' || updatedQuote.payment_status !== 'completed') {
        throw new Error('Database state verification failed - updates not applied correctly');
      }

      // Log the action for audit trail (only after successful DB update)
      try {
        await logWorkflowStage(
          quote.id,
          organizationId,
          'completed',
          'interim_contract_sent',
          {
            document_url: documentUrl,
            generated_at: new Date().toISOString(),
            client_name: clientData?.name || quote.client?.name || quote.client_name,
            insurer_name: insurerInfo?.insurer_name || selectedQuote?.insurer_name,
            contract_type: 'interim',
            status: 'interim_contract_sent',
            workflow_stage_updated: 'completed',
            payment_status_updated: 'completed',
            verified_state: true
          },
          user?.id
        );
      } catch (auditError) {
        console.error('⚠️ Audit logging failed (contract generation succeeded):', auditError);
        // Don't fail the entire operation for audit logging issues
      }
      
      const contracts = {
        interim: {
          id: `INT-${Date.now()}`,
          generatedAt: new Date().toISOString(),
          documentUrl,
          status: 'generated'
        }
      };
      
      // Update local state with verified data from database
      setInterimGenerated(true);
      setQuote(updatedQuote);
      onContractsGenerated(contracts);
      
      toast({
        title: "Success",
        description: "Interim contract sent to client"
      });
      
    } catch (error) {
      console.error('❌ Error generating interim contract:', error);
      
      // Attempt to rollback by checking current state
      try {
        const { data: currentQuote } = await supabase
          .from('quotes')
          .select('workflow_stage, payment_status, interim_contract_url')
          .eq('id', quote.id)
          .single();
          
        if (currentQuote?.interim_contract_url) {
          console.warn('⚠️ Partial update detected - manual cleanup may be required');
        }
      } catch (rollbackError) {
        console.error('❌ State verification after error failed:', rollbackError);
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate interim contract",
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
      // Simulate final contract receipt
      
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

      // Log the action for audit trail
      await logWorkflowStage(
        quote.id,
        organizationId,
        'contract-generation',
        'final_contract_received',
        {
          document_url: finalDocumentUrl,
          received_at: new Date().toISOString(),
          compliance_status: 'approved',
          contract_type: 'final',
          workflow_stage_updated: 'completed'
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
      
      // Final contract simulation completed
      
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

  const generateFinalContract = async () => {
    if (!quote?.id || !organizationId) return;
    
    setIsGeneratingFinal(true);
    
    try {
      // Generate final contract document
      const finalDocumentUrl = `https://contracts.example.com/final/${quote.id}_${Date.now()}.pdf`;
      
      // Update quote with final contract URL
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          final_contract_url: finalDocumentUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (updateError) throw updateError;

      // Log the action for audit trail
      await logWorkflowStage(
        quote.id,
        organizationId,
        'completed',
        'final_contract_generated',
        {
          document_url: finalDocumentUrl,
          generated_at: new Date().toISOString(),
          client_name: clientData?.name || quote.client?.name || quote.client_name,
          insurer_name: insurerInfo?.insurer_name || selectedQuote?.insurer_name,
          contract_type: 'final',
          status: 'generated'
        },
        user?.id
      );
      
      setFinalReceived(true);
      setQuote(prev => ({ ...prev, final_contract_url: finalDocumentUrl }));
      
      toast({
        title: "Success",
        description: "Final contract generated successfully"
      });
      
    } catch (error) {
      console.error('❌ Error generating final contract:', error);
      toast({
        title: "Error",
        description: "Failed to generate final contract",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingFinal(false);
    }
  };

  const generateContractPDF = (contractType: 'interim' | 'final') => {
    const contractTitle = contractType === 'interim' ? 'INTERIM CONTRACT' : 'FINAL POLICY DOCUMENT';
    const currentDate = new Date().toLocaleDateString();
    
    // Create comprehensive PDF content with actual contract details
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
/F2 5 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 6 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Times-Roman
>>
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Times-Bold
>>
endobj

6 0 obj
<<
/Length 1200
>>
stream
BT
/F2 16 Tf
50 750 Td
(${contractTitle}) Tj
0 -30 Td
/F1 12 Tf
(Date: ${currentDate}) Tj
0 -40 Td
/F2 14 Tf
(CONTRACT DETAILS) Tj
0 -25 Td
/F1 11 Tf
(Quote Number: ${quote?.quote_number || 'N/A'}) Tj
0 -15 Td
(Client Name: ${clientData?.name || quote?.client?.name || quote?.client_name || 'Unknown'}) Tj
0 -15 Td
(Policy Type: ${quote?.policy_type || 'N/A'}) Tj
0 -15 Td
(Sum Insured: ₦${Number(quote?.sum_insured || 0).toLocaleString()}) Tj
0 -15 Td
(Premium: ₦${Number(insurerInfo?.premium_quoted || quote?.premium || 0).toLocaleString()}) Tj
0 -15 Td
(Insurer: ${insurerInfo?.insurer_name || 'Unknown Insurer'}) Tj
0 -30 Td
/F2 14 Tf
(TERMS AND CONDITIONS) Tj
0 -20 Td
/F1 11 Tf
(1. Coverage Period: From policy inception date to expiry date) Tj
0 -15 Td
(2. Premium Payment: Premium must be paid before coverage begins) Tj
0 -15 Td
(3. Claims Process: All claims must be reported within 30 days) Tj
0 -15 Td
(4. Policy Renewal: Subject to annual review and agreement) Tj
0 -30 Td
/F2 12 Tf
(PAYMENT INFORMATION) Tj
0 -20 Td
/F1 11 Tf
(Payment Status: ${paymentTransaction?.status === 'completed' ? 'PAID' : 'PENDING'}) Tj
0 -15 Td
(Transaction ID: ${paymentTransaction?.id?.slice(0, 12) || 'N/A'}) Tj
0 -30 Td
/F1 10 Tf
(This document serves as ${contractType === 'interim' ? 'temporary coverage until final policy issuance' : 'your official policy document'}) Tj
0 -20 Td
(Generated on: ${currentDate}) Tj
ET
endstream
endobj

xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000380 00000 n 
0000000459 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
1690
%%EOF`;

    return new Blob([pdfContent], { type: 'application/pdf' });
  };

  const downloadContract = (url: string, filename: string) => {
    try {
      // Generate PDF with actual contract content
      const contractType = filename.includes('Interim') ? 'interim' : 'final';
      const pdfBlob = generateContractPDF(contractType);
      const downloadUrl = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download Started",
        description: `${filename} downloaded successfully`
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download the contract document",
        variant: "destructive"
      });
    }
  };

  const emailToClient = async (contractType: 'interim' | 'final') => {
    if (!quote?.client_email && !clientData?.email) {
      toast({
        title: "Email Failed",
        description: "Client email address not found",
        variant: "destructive"
      });
      return;
    }

    try {
      const clientEmail = quote?.client_email || clientData?.email;
      const contractName = contractType === 'interim' ? 'Interim Contract' : 'Final Policy Document';
      
      // Generate the PDF contract content for attachment
      const contractPdfBlob = generateContractPDF(contractType);
      const contractBuffer = await contractPdfBlob.arrayBuffer();
      const contractBase64 = btoa(String.fromCharCode(...new Uint8Array(contractBuffer)));
      
      const emailMessage = `Dear ${clientData?.name || quote?.client_name},

Your ${contractName} is now ready for review and is attached to this email.

Contract Details:
- Quote Number: ${quote?.quote_number}
- Policy Type: ${quote?.policy_type}
- Sum Insured: ₦${Number(quote?.sum_insured || 0).toLocaleString()}
- Premium: ₦${Number(insurerInfo?.premium_quoted || quote?.premium || 0).toLocaleString()}
- Insurer: ${insurerInfo?.insurer_name || 'N/A'}

${contractType === 'interim' ? 
  'This is your interim contract which provides immediate coverage while we finalize your policy documentation.' : 
  'This is your final policy document. Please review and keep it safe for your records.'}

The contract document is attached as a PDF file for your records.

If you have any questions, please don't hesitate to contact us.

Best regards,
Your Insurance Team`;

      // Send email with contract attachment using updated function
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email-notification', {
        body: {
          type: 'contract_delivery',
          recipientEmail: clientEmail,
          subject: `Your ${contractName} - ${quote?.quote_number}`,
          message: emailMessage,
          metadata: {
            quote_id: quote?.id,
            contract_type: contractType,
            contract_attachment: {
              filename: `${contractType === 'interim' ? 'Interim_Contract' : 'Final_Policy'}_${quote?.quote_number || 'UNKNOWN'}.pdf`,
              content: contractBase64,
              contentType: 'application/pdf'
            }
          }
        }
      });

      if (emailError) {
        throw new Error(emailError.message);
      }

      // Log the email action with attachment info for audit trail
      await logWorkflowStage(
        quote?.id!,
        organizationId!,
        'contract-generation',
        `${contractType}_contract_emailed_with_attachment`,
        {
          recipient: clientEmail,
          contract_type: contractType,
          contract_filename: `${contractType === 'interim' ? 'Interim_Contract' : 'Final_Policy'}_${quote?.quote_number || 'UNKNOWN'}.pdf`,
          email_subject: `Your ${contractName} - ${quote?.quote_number}`,
          attachment_included: true,
          sent_at: new Date().toISOString(),
          email_response: emailData
        },
        user?.id
      );

      toast({
        title: "Email Sent",
        description: `${contractName} with attachment sent to ${clientEmail}`
      });
    } catch (error) {
      console.error('Email failed:', error);
      toast({
        title: "Email Failed", 
        description: "Unable to send contract email with attachment",
        variant: "destructive"
      });
    }
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => emailToClient('interim')}
                    >
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
                     {interimGenerated && (
                       <Button 
                         size="sm" 
                         onClick={generateFinalContract}
                         disabled={isGeneratingFinal}
                       >
                         {isGeneratingFinal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                         {isGeneratingFinal ? "Generating..." : "Generate Final"}
                       </Button>
                     )}
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => emailToClient('final')}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Email to Client
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
                return Number(premium).toLocaleString();
              })()}</p>
            </div>
            <div>
              <span className="text-gray-600">Sum Insured:</span>
              <p className="font-semibold">₦{(() => {
                const sumInsured = quote?.sum_insured || selectedQuote?.sum_insured || 0;
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
