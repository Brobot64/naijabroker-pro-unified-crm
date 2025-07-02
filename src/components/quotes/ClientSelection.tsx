
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, CheckCircle } from "lucide-react";

interface ClientSelectionProps {
  evaluatedQuotes: any[];
  clientData: any;
  onSelectionComplete: (selection: any) => void;
  onBack: () => void;
}

export const ClientSelection = ({ evaluatedQuotes, clientData, onSelectionComplete, onBack }: ClientSelectionProps) => {
  const [portalLinkGenerated, setPortalLinkGenerated] = useState(false);
  const [clientSelection, setClientSelection] = useState<any>(null);

  const generatePortalLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/client-portal?email=${encodeURIComponent(clientData.email)}&quote=selection`;
    setPortalLinkGenerated(true);
    
    // In a real implementation, you would send this link to the client
    console.log("Generated portal link:", link);
  };

  const simulateClientSelection = (quote: any) => {
    setClientSelection(quote);
    onSelectionComplete(quote);
  };

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
              Generate a secure portal link for {clientData.name} to review and select from the available quotes.
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={generatePortalLink}
                disabled={portalLinkGenerated}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {portalLinkGenerated ? "Portal Link Generated" : "Generate Portal Link"}
              </Button>
              {portalLinkGenerated && (
                <Badge variant="secondary">Link sent to {clientData.email}</Badge>
              )}
            </div>
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
          <CardTitle>Available Quotes for Client Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {evaluatedQuotes?.map((quote, index) => (
              <div key={quote.insurer_id || index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{quote.insurer_name}</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => simulateClientSelection(quote)}
                  >
                    Simulate Client Selection
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Annual Premium:</span>
                    <p className="font-semibold text-lg">₦{(quote.premium_quoted || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Commission Split:</span>
                    <p className="font-semibold">{quote.commission_split}%</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Rating Score:</span>
                    <Badge variant="secondary">{quote.rating_score || 0}/100</Badge>
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
