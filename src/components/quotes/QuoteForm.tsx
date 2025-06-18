import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QuoteService } from "@/services/database/quoteService";
import { AuditService } from "@/services/database/auditService";
import { useAuth } from "@/contexts/AuthContext";
import { Quote, QuoteInsert } from "@/services/database/types";
import { QuoteBasicInfo } from "./forms/QuoteBasicInfo";
import { QuoteClientInfo } from "./forms/QuoteClientInfo";
import { QuoteDetails } from "./forms/QuoteDetails";

interface QuoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote?: Quote | null;
  onSuccess?: () => void;
}

export const QuoteForm = ({ open, onOpenChange, quote, onSuccess }: QuoteFormProps) => {
  const [formData, setFormData] = useState({
    quote_number: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    underwriter: "",
    policy_type: "",
    sum_insured: "",
    premium: "",
    commission_rate: "",
    valid_until: "",
    terms_conditions: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, organizationId } = useAuth();

  useEffect(() => {
    if (quote) {
      setFormData({
        quote_number: quote.quote_number,
        client_name: quote.client_name,
        client_email: quote.client_email || "",
        client_phone: quote.client_phone || "",
        underwriter: quote.underwriter,
        policy_type: quote.policy_type,
        sum_insured: quote.sum_insured.toString(),
        premium: quote.premium.toString(),
        commission_rate: quote.commission_rate.toString(),
        valid_until: quote.valid_until,
        terms_conditions: quote.terms_conditions || "",
        notes: quote.notes || ""
      });
    } else {
      // Reset form for new quote
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      
      setFormData({
        quote_number: `QTE-${Date.now().toString().slice(-6)}`,
        client_name: "",
        client_email: "",
        client_phone: "",
        underwriter: "",
        policy_type: "",
        sum_insured: "",
        premium: "",
        commission_rate: "",
        valid_until: validUntil.toISOString().split('T')[0],
        terms_conditions: "",
        notes: ""
      });
    }
  }, [quote, open]);

  const handleSubmit = async () => {
    if (!formData.quote_number || !formData.client_name || !formData.underwriter) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!organizationId) {
      toast({
        title: "Error",
        description: "No organization found",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const quoteData: QuoteInsert = {
        organization_id: organizationId,
        quote_number: formData.quote_number,
        client_name: formData.client_name,
        client_email: formData.client_email || null,
        client_phone: formData.client_phone || null,
        underwriter: formData.underwriter,
        policy_type: formData.policy_type,
        sum_insured: parseFloat(formData.sum_insured) || 0,
        premium: parseFloat(formData.premium) || 0,
        commission_rate: parseFloat(formData.commission_rate) || 0,
        valid_until: formData.valid_until,
        created_by: user!.id,
        terms_conditions: formData.terms_conditions || null,
        notes: formData.notes || null
      };

      let result;
      if (quote) {
        result = await QuoteService.update(quote.id, quoteData);
        await AuditService.log({
          user_id: user!.id,
          action: 'QUOTE_UPDATED',
          resource_type: 'quote',
          resource_id: quote.id,
          new_values: quoteData,
          severity: 'medium'
        });
      } else {
        result = await QuoteService.create(quoteData);
        await AuditService.log({
          user_id: user!.id,
          action: 'QUOTE_CREATED',
          resource_type: 'quote',
          resource_id: result.id,
          new_values: quoteData,
          severity: 'medium'
        });
      }

      toast({
        title: quote ? "Quote Updated" : "Quote Created",
        description: `Quote ${formData.quote_number} has been ${quote ? 'updated' : 'created'} successfully`,
      });

      if (onSuccess) onSuccess();
      onOpenChange(false);

    } catch (error) {
      console.error('Quote operation error:', error);
      toast({
        title: "Operation Failed",
        description: `Failed to ${quote ? 'update' : 'create'} quote. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quote ? 'Edit Quote' : 'Create New Quote'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <QuoteBasicInfo formData={formData} setFormData={setFormData} />
          <QuoteClientInfo formData={formData} setFormData={setFormData} />
          <QuoteDetails formData={formData} setFormData={setFormData} />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (quote ? "Updating..." : "Creating...") : (quote ? "Update Quote" : "Create Quote")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
