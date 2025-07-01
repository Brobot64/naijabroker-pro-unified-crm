
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Download, Send } from "lucide-react";

interface RFQGenerationProps {
  quoteData: any;
  clauses: any[];
  onRFQGenerated: (rfqData: any) => void;
  onBack: () => void;
}

export const RFQGeneration = ({ quoteData, clauses, onRFQGenerated, onBack }: RFQGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [rfqGenerated, setRfqGenerated] = useState(false);

  const handleGenerateRFQ = async () => {
    setIsGenerating(true);
    
    // Simulate RFQ generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const rfqData = {
      id: `RFQ-${Date.now()}`,
      quoteReference: quoteData.quoteNumber,
      generatedAt: new Date().toISOString(),
      status: 'generated',
      documentUrl: '#', // Would be actual document URL
      clauses: clauses
    };
    
    setRfqGenerated(true);
    setIsGenerating(false);
    onRFQGenerated(rfqData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">RFQ Document Generation</h2>
        </div>
        {rfqGenerated && (
          <Button onClick={() => onRFQGenerated({ status: 'locked' })}>
            Continue to Insurer Matching
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              RFQ Content Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Request for Quotation</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Client:</strong> {quoteData?.client?.name}</p>
                <p><strong>Class of Insurance:</strong> {quoteData?.classOfInsurance}</p>
                <p><strong>Sum Insured:</strong> {quoteData?.currency} {parseFloat(quoteData?.sumInsured || 0).toLocaleString()}</p>
                <p><strong>Coverage Period:</strong> {quoteData?.commencementDate} to {quoteData?.expiryDate}</p>
                <p><strong>Currency:</strong> {quoteData?.currency}</p>
              </div>
            </div>

            {clauses && clauses.length > 0 && (
              <div>
                <h5 className="font-medium mb-2">Selected Clauses & Add-ons</h5>
                <div className="space-y-1">
                  {clauses.map((clause, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{clause.name}</span>
                      <Badge variant="outline">{clause.category}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button 
                onClick={handleGenerateRFQ} 
                disabled={isGenerating || rfqGenerated}
                className="w-full"
              >
                {isGenerating ? "Generating RFQ..." : rfqGenerated ? "RFQ Generated" : "Generate RFQ Document"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rfqGenerated ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">RFQ Document Ready</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Your branded RFQ document has been generated successfully.
                  </p>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download RFQ (PDF)
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Preview Email Template
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-2">Next Steps</h5>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Review the generated RFQ document</li>
                    <li>• Download for manual distribution, or</li>
                    <li>• Continue to automatic insurer matching</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate the RFQ document to see available actions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
