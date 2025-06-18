
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PolicyService } from "@/services/database/policyService";
import { AuditService } from "@/services/database/auditService";
import { useAuth } from "@/contexts/AuthContext";
import { Policy, PolicyInsert } from "@/services/database/types";

interface PolicyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: Policy | null;
  onSuccess?: () => void;
}

export const PolicyForm = ({ open, onOpenChange, policy, onSuccess }: PolicyFormProps) => {
  const [formData, setFormData] = useState({
    policy_number: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    underwriter: "",
    policy_type: "",
    sum_insured: "",
    premium: "",
    commission_rate: "",
    commission_amount: "",
    start_date: "",
    end_date: "",
    terms_conditions: "",
    notes: ""
  });
  const [coInsurers, setCoInsurers] = useState<Array<{name: string, percentage: number}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (policy) {
      setFormData({
        policy_number: policy.policy_number,
        client_name: policy.client_name,
        client_email: policy.client_email || "",
        client_phone: policy.client_phone || "",
        underwriter: policy.underwriter,
        policy_type: policy.policy_type,
        sum_insured: policy.sum_insured.toString(),
        premium: policy.premium.toString(),
        commission_rate: policy.commission_rate.toString(),
        commission_amount: policy.commission_amount.toString(),
        start_date: policy.start_date,
        end_date: policy.end_date,
        terms_conditions: policy.terms_conditions || "",
        notes: policy.notes || ""
      });
      setCoInsurers((policy.co_insurers as any) || []);
    } else {
      // Reset form for new policy
      setFormData({
        policy_number: `POL-${Date.now().toString().slice(-6)}`,
        client_name: "",
        client_email: "",
        client_phone: "",
        underwriter: "",
        policy_type: "",
        sum_insured: "",
        premium: "",
        commission_rate: "",
        commission_amount: "",
        start_date: "",
        end_date: "",
        terms_conditions: "",
        notes: ""
      });
      setCoInsurers([]);
    }
  }, [policy, open]);

  const calculateCommission = () => {
    const premium = parseFloat(formData.premium) || 0;
    const rate = parseFloat(formData.commission_rate) || 0;
    const commission = (premium * rate) / 100;
    setFormData(prev => ({
      ...prev,
      commission_amount: commission.toFixed(2)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.policy_number || !formData.client_name || !formData.underwriter) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!user?.organization_id) {
      toast({
        title: "Error",
        description: "No organization found",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const policyData: PolicyInsert = {
        organization_id: user.organization_id,
        policy_number: formData.policy_number,
        client_name: formData.client_name,
        client_email: formData.client_email || null,
        client_phone: formData.client_phone || null,
        underwriter: formData.underwriter,
        policy_type: formData.policy_type,
        sum_insured: parseFloat(formData.sum_insured) || 0,
        premium: parseFloat(formData.premium) || 0,
        commission_rate: parseFloat(formData.commission_rate) || 0,
        commission_amount: parseFloat(formData.commission_amount) || 0,
        start_date: formData.start_date,
        end_date: formData.end_date,
        created_by: user.id,
        co_insurers: coInsurers,
        terms_conditions: formData.terms_conditions || null,
        notes: formData.notes || null
      };

      let result;
      if (policy) {
        result = await PolicyService.update(policy.id, policyData);
        await AuditService.log({
          user_id: user.id,
          action: 'POLICY_UPDATED',
          resource_type: 'policy',
          resource_id: policy.id,
          new_values: policyData,
          severity: 'medium'
        });
      } else {
        result = await PolicyService.create(policyData);
        await AuditService.log({
          user_id: user.id,
          action: 'POLICY_CREATED',
          resource_type: 'policy',
          resource_id: result.id,
          new_values: policyData,
          severity: 'medium'
        });
      }

      toast({
        title: policy ? "Policy Updated" : "Policy Created",
        description: `Policy ${formData.policy_number} has been ${policy ? 'updated' : 'created'} successfully`,
      });

      if (onSuccess) onSuccess();
      onOpenChange(false);

    } catch (error) {
      console.error('Policy operation error:', error);
      toast({
        title: "Operation Failed",
        description: `Failed to ${policy ? 'update' : 'create'} policy. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{policy ? 'Edit Policy' : 'Create New Policy'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="policy_number">Policy Number *</Label>
              <Input
                id="policy_number"
                value={formData.policy_number}
                onChange={(e) => setFormData({...formData, policy_number: e.target.value})}
                placeholder="POL-XXXXXX"
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
              <CardTitle>Financial Details</CardTitle>
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
                    onChange={(e) => {
                      setFormData({...formData, premium: e.target.value});
                      setTimeout(calculateCommission, 100);
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    value={formData.commission_rate}
                    onChange={(e) => {
                      setFormData({...formData, commission_rate: e.target.value});
                      setTimeout(calculateCommission, 100);
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="commission_amount">Commission Amount (₦)</Label>
                  <Input
                    id="commission_amount"
                    type="number"
                    value={formData.commission_amount}
                    onChange={(e) => setFormData({...formData, commission_amount: e.target.value})}
                    placeholder="0.00"
                    readOnly
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="terms_conditions">Terms & Conditions</Label>
              <Textarea
                id="terms_conditions"
                value={formData.terms_conditions}
                onChange={(e) => setFormData({...formData, terms_conditions: e.target.value})}
                rows={4}
                placeholder="Policy terms and conditions"
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
            {isSubmitting ? (policy ? "Updating..." : "Creating...") : (policy ? "Update Policy" : "Create Policy")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
