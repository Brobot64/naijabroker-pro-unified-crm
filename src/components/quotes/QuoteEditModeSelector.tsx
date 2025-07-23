import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, User, FileText } from "lucide-react";

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  policy_type: string;
  premium: number;
  status: string;
  workflow_stage: string;
  created_at: string;
  valid_until: string;
}

interface QuoteEditModeSelectorProps {
  quote: Quote;
  onContinueQuoteEdit: () => void;
  onEditClientDetails: () => void;
  onBack: () => void;
}

export const QuoteEditModeSelector = ({
  quote,
  onContinueQuoteEdit,
  onEditClientDetails,
  onBack
}: QuoteEditModeSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Quote {quote.quote_number}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div><strong>Quote Number:</strong> {quote.quote_number}</div>
            <div><strong>Client:</strong> {quote.client_name}</div>
            <div><strong>Policy Type:</strong> {quote.policy_type}</div>
            <div><strong>Premium:</strong> ₦{quote.premium?.toLocaleString()}</div>
            <div><strong>Status:</strong> {quote.status}</div>
            <div><strong>Current Stage:</strong> {quote.workflow_stage}</div>
            <div><strong>Created:</strong> {new Date(quote.created_at).toLocaleDateString()}</div>
            <div><strong>Valid Until:</strong> {new Date(quote.valid_until).toLocaleDateString()}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choose Edit Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={onContinueQuoteEdit}
              className="h-24 flex flex-col items-center justify-center gap-2 text-left"
              variant="outline"
            >
              <FileText className="h-8 w-8" />
              <div>
                <div className="font-semibold">Continue to Edit Quote</div>
                <div className="text-sm opacity-70">
                  Resume from current stage: {quote.workflow_stage}
                </div>
              </div>
            </Button>

            <Button 
              onClick={onEditClientDetails}
              className="h-24 flex flex-col items-center justify-center gap-2 text-left"
              variant="outline"
            >
              <User className="h-8 w-8" />
              <div>
                <div className="font-semibold">Continue to Edit Client Details</div>
                <div className="text-sm opacity-70">
                  Modify client information for this quote
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};