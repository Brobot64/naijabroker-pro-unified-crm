import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PolicyService } from "@/services/database/policyService";
import { AuditService } from "@/services/database/auditService";
import { useAuth } from "@/contexts/AuthContext";
import { Policy, PolicyInsert } from "@/services/database/types";
import { PolicyBasicInfo } from "./forms/PolicyBasicInfo";
import { PolicyClientInfo } from "./forms/PolicyClientInfo";
import { PolicyFinancialDetails } from "./forms/PolicyFinancialDetails";
import { PolicyAdditionalInfo } from "./forms/PolicyAdditionalInfo";

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
  const { user, organizationId } = useAuth();

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
      const policyData: PolicyInsert = {
        organization_id: organizationId,
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
        created_by: user!.id,
        co_insurers: coInsurers,
        terms_conditions: formData.terms_conditions || null,
        notes: formData.notes || null
      };

      let result;
      if (policy) {
        result = await PolicyService.update(policy.id, policyData);
        await AuditService.log({
          user_id: user!.id,
          action: 'POLICY_UPDATED',
          resource_type: 'policy',
          resource_id: policy.id,
          new_values: policyData,
          severity: 'medium'
        });
      } else {
        result = await PolicyService.create(policyData);
        await AuditService.log({
          user_id: user!.id,
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
          <PolicyBasicInfo formData={formData} setFormData={setFormData} />
          <PolicyClientInfo formData={formData} setFormData={setFormData} />
          <PolicyFinancialDetails 
            formData={formData} 
            setFormData={setFormData}
            calculateCommission={calculateCommission}
          />
          <PolicyAdditionalInfo formData={formData} setFormData={setFormData} />
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
