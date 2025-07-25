import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PolicyService } from "@/services/database/policyService";
import { AuditService } from "@/services/database/auditService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, User, DollarSign } from "lucide-react";

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

interface PolicyIssuanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
  onSuccess?: () => void;
}

export const PolicyIssuanceModal = ({ open, onOpenChange, quote, onSuccess }: PolicyIssuanceModalProps) => {
  const [formData, setFormData] = useState({
    policy_number: "",
    start_date: "",
    end_date: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, organizationId } = useAuth();

  useEffect(() => {
    if (quote && open) {
      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const endDate = nextYear.toISOString().split('T')[0];

      setFormData({
        policy_number: `POL-${Date.now().toString().slice(-6)}`,
        start_date: today,
        end_date: endDate,
        notes: ""
      });
    }
  }, [quote, open]);

  const handleIssuePolicy = async () => {
    if (!quote || !organizationId || !user) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive"
      });
      return;
    }

    if (!formData.policy_number || !formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate commission amount
      const commission_amount = (quote.premium * quote.commission_rate) / 100;

      // Create policy from quote data
      const policyData = {
        organization_id: organizationId,
        policy_number: formData.policy_number,
        client_name: quote.client_name,
        client_email: quote.client_email || null,
        client_phone: quote.client_phone || null,
        underwriter: quote.underwriter,
        policy_type: quote.policy_type,
        sum_insured: quote.sum_insured,
        premium: quote.premium,
        commission_rate: quote.commission_rate,
        commission_amount: commission_amount,
        start_date: formData.start_date,
        end_date: formData.end_date,
        created_by: user.id,
        status: 'active' as const,
        terms_conditions: quote.terms_conditions || null,
        notes: formData.notes || null,
        co_insurers: []
      };

      const newPolicy = await PolicyService.create(policyData);

      // Update quote to mark as converted to policy
      await supabase
        .from('quotes')
        .update({ converted_to_policy: newPolicy.id })
        .eq('id', quote.id);

      // Log audit trail
      await AuditService.log({
        user_id: user.id,
        action: 'POLICY_ISSUED_FROM_QUOTE',
        resource_type: 'policy',
        resource_id: newPolicy.id,
        new_values: {
          ...policyData,
          quote_id: quote.id,
          quote_number: quote.quote_number,
          final_contract_inherited: !!quote.final_contract_url
        },
        severity: 'high'
      });

      toast({
        title: "Policy Issued Successfully",
        description: `Policy ${formData.policy_number} has been issued for ${quote.client_name}`,
      });

      if (onSuccess) onSuccess();
      onOpenChange(false);

    } catch (error) {
      console.error('Policy issuance error:', error);
      toast({
        title: "Issuance Failed",
        description: "Failed to issue policy. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Issue New Policy from Quote</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quote Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quote Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Quote Number:</span>
                  <span>{quote.quote_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Client:</span>
                  <span>{quote.client_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Policy Type:</span>
                  <span>{quote.policy_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Underwriter:</span>
                  <span>{quote.underwriter}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Sum Insured:</span>
                  <span className="font-semibold">₦{quote.sum_insured.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Premium:</span>
                  <span className="font-semibold text-green-600">₦{quote.premium.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{quote.status}</Badge>
                  <Badge variant="secondary">{quote.workflow_stage}</Badge>
                </div>
                {quote.final_contract_url && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 text-sm">Final contract available</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Policy Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Policy Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="policy_number">Policy Number *</Label>
                  <Input
                    id="policy_number"
                    value={formData.policy_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, policy_number: e.target.value }))}
                    placeholder="POL-XXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes for this policy..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contract Inheritance Notice */}
          {quote.final_contract_url && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">Final contract will be inherited from quote</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  The finalized contract document from this quote will be automatically linked to this policy.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleIssuePolicy} disabled={isSubmitting}>
            {isSubmitting ? "Issuing Policy..." : "Issue Policy"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};