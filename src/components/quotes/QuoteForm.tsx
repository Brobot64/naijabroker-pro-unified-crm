import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QuoteService } from "@/services/database/quoteService";
import { AuditService } from "@/services/database/auditService";
import { useAuth } from "@/contexts/AuthContext";
import { Quote, QuoteInsert } from "@/services/database/types";

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quote_number">Quote Number *</Label>
              <Input
                id="quote_number"
                value={formData.quote_number}
                onChange={(e) => setFormData({...formData, quote_number: e.target.value})}
                placeholder="QTE-XXXXXX"
              />
            </div>
            <div>
              <Label htmlFor="policy_type">Policy Type *</Label>
              <select
                id="policy_type"
                value={formData.policy_type}
                onChange={(e) => setFormData({...formData, policy_type: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Type</option>
                <option value="Motor">Motor Insurance</option>
                <option value="Fire">Fire Insurance</option>
                <option value="Marine">Marine Insurance</option>
                <option value="General">General Insurance</option>
                <option value="Life">Life Insurance</option>
              </select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="client_name">Client Name *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                    placeholder="Client full name"
                  />
                </div>
                <div>
                  <Label htmlFor="client_email">Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                    placeholder="client@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="client_phone">Phone</Label>
                  <Input
                    id="client_phone"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                    placeholder="+234XXXXXXXXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sum_insured">Sum Insured (₦)</Label>
                  <Input
                    id="sum_insured"
                    type="number"
                    value={formData.sum_insured}
                    onChange={(e) => setFormData({...formData, sum_insured: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="premium">Premium (₦)</Label>
                  <Input
                    id="premium"
                    type="number"
                    value={formData.premium}
                    onChange={(e) => setFormData({...formData, premium: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({...formData, commission_rate: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="underwriter">Underwriter *</Label>
                  <Input
                    id="underwriter"
                    value={formData.underwriter}
                    onChange={(e) => setFormData({...formData, underwriter: e.target.value})}
                    placeholder="Insurance company name"
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Valid Until</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="terms_conditions">Terms & Conditions</Label>
              <Textarea
                id="terms_conditions"
                value={formData.terms_conditions}
                onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
                rows={4}
                placeholder="Quote terms and conditions"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={4}
                placeholder="Additional notes"
              />
            </div>
          </div>
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
