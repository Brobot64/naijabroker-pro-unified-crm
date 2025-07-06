
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Eye } from "lucide-react";

interface RFQGenerationEnhancedProps {
  quoteData: any;
  clauses: any[];
  onRFQGenerated: (rfqData: any) => void;
  onBack: () => void;
}

export const RFQGenerationEnhanced = ({ quoteData, clauses, onRFQGenerated, onBack }: RFQGenerationEnhancedProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rfqContent, setRfqContent] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const generateRFQContent = () => {
    if (!quoteData) return '';

    return `REQUEST FOR QUOTATION

Client Information:
- Name: ${quoteData.client_name || 'N/A'}
- Email: ${quoteData.client_email || 'N/A'}
- Phone: ${quoteData.client_phone || 'N/A'}

Insurance Details:
- Class of Insurance: ${quoteData.policy_type || 'N/A'}
- Sum Insured: ₦${quoteData.sum_insured?.toLocaleString() || '0'}
- Premium: ₦${quoteData.premium?.toLocaleString() || '0'}
- Commission Rate: ${quoteData.commission_rate || '0'}%

Insured Item Details:
- Item/Asset: ${quoteData.insured_item || 'N/A'}
- Location: ${quoteData.location || 'N/A'}
- Description: ${quoteData.insured_description || 'N/A'}
- Risk Assessment: ${quoteData.risk_details || 'N/A'}
- Coverage Requirements: ${quoteData.coverage_requirements || 'N/A'}

Terms & Conditions:
${quoteData.terms_conditions || 'Standard terms and conditions apply.'}

${clauses && clauses.length > 0 ? `
Selected Clauses:
${clauses.map((clause, index) => `${index + 1}. ${clause.name || clause.title}`).join('\n')}
` : ''}

Validity: ${quoteData.valid_until || 'N/A'}

Please provide your best quotation for the above requirements.

${additionalNotes ? `Additional Notes:\n${additionalNotes}` : ''}
`;
  };

  const handleGenerateRFQ = () => {
    setLoading(true);
    
    try {
      const content = generateRFQContent();
      setRfqContent(content);
      
      toast({
        title: "Success",
        description: "RFQ document generated successfully",
      });
    } catch (error) {
      console.error('Error generating RFQ:', error);
      toast({
        title: "Error",
        description: "Failed to generate RFQ document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRFQ = () => {
    if (!rfqContent) return;
    
    const blob = new Blob([rfqContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RFQ_${quoteData?.quote_number || 'Quote'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContinue = () => {
    if (!rfqContent) {
      toast({
        title: "Error",
        description: "Please generate RFQ document first",
        variant: "destructive"
      });
      return;
    }

    const rfqData = {
      content: rfqContent,
      generated_at: new Date().toISOString(),
      quote_id: quoteData?.id,
      additional_notes: additionalNotes,
    };

    onRFQGenerated(rfqData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          RFQ Generation
        </CardTitle>
        <p className="text-sm text-gray-600">
          Generate Request for Quotation document for {quoteData?.client_name || 'client'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quote Summary */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Quote Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="space-y-2 text-sm">
              <div><strong>Quote #:</strong> {quoteData?.quote_number || 'N/A'}</div>
              <div><strong>Client:</strong> {quoteData?.client_name || 'N/A'}</div>
              <div><strong>Insurance Type:</strong> {quoteData?.policy_type || 'N/A'}</div>
              <div><strong>Sum Insured:</strong> ₦{quoteData?.sum_insured?.toLocaleString() || '0'}</div>
              <div><strong>Premium:</strong> ₦{quoteData?.premium?.toLocaleString() || '0'}</div>
              <div><strong>Valid Until:</strong> {quoteData?.valid_until || 'N/A'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="additional_notes">Additional Notes for RFQ</Label>
          <Textarea
            id="additional_notes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Add any additional instructions or requirements for insurers..."
            rows={3}
          />
        </div>

        {/* Generate RFQ Button */}
        <div className="flex gap-4">
          <Button onClick={handleGenerateRFQ} disabled={loading}>
            {loading ? "Generating..." : "Generate RFQ Document"}
          </Button>
          
          {rfqContent && (
            <>
              <Button variant="outline" onClick={handleDownloadRFQ}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </>
          )}
        </div>

        {/* RFQ Preview */}
        {rfqContent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                RFQ Document Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
                {rfqContent}
              </pre>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!rfqContent}>
            Continue to Insurer Matching
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
