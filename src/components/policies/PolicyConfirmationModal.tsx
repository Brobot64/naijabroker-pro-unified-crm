import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, User, DollarSign, AlertTriangle } from "lucide-react";

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  underwriter: string;
  policy_type: string;
  sum_insured: number;
  premium: number;
  commission_rate: number;
  final_contract_url?: string;
  terms_conditions?: string;
  notes?: string;
  valid_until: string;
  status: string;
  workflow_stage: string;
}

interface PolicyConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
  onConfirm: () => void;
  policyNumber: string;
  startDate: string;
  endDate: string;
}

export const PolicyConfirmationModal = ({ 
  open, 
  onOpenChange, 
  quote, 
  onConfirm, 
  policyNumber, 
  startDate, 
  endDate 
}: PolicyConfirmationModalProps) => {
  if (!quote) return null;

  const commission_amount = (quote.premium * quote.commission_rate) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirm Policy Creation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Confirmation Required</span>
            </div>
            <p className="text-amber-600 text-sm">
              You are about to create a new policy from the selected quote. This action cannot be undone and will mark the quote as converted.
            </p>
          </div>

          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quote Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quote Number:</span>
                  <span className="font-medium">{quote.quote_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{quote.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Policy Type:</span>
                  <span className="font-medium">{quote.policy_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Underwriter:</span>
                  <span className="font-medium">{quote.underwriter}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sum Insured:</span>
                  <span className="font-semibold">₦{quote.sum_insured.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Premium:</span>
                  <span className="font-semibold text-green-600">₦{quote.premium.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission:</span>
                  <span className="font-medium">₦{commission_amount.toLocaleString()} ({quote.commission_rate}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{quote.status}</Badge>
                    <Badge variant="secondary">{quote.workflow_stage}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Policy to be Created
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-muted-foreground text-sm">Policy Number</span>
                <div className="font-medium">{policyNumber}</div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Start Date</span>
                <div className="font-medium">{startDate}</div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">End Date</span>
                <div className="font-medium">{endDate}</div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Inheritance */}
          {quote.final_contract_url && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">Final contract will be inherited</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  The finalized contract document from this quote will be automatically linked to the new policy.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-primary text-primary-foreground">
            Confirm & Create Policy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};