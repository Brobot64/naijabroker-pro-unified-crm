
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateSplits } from "@/utils/financialCalculations";

interface Policy {
  id: string;
  client: string;
  type: string;
  sumInsured: string;
  premium: string;
  status: string;
  startDate: string;
  endDate: string;
  underwriter: string;
  commission: string;
}

interface CoInsurerSplit {
  insurerId: string;
  insurerName: string;
  percentage: number;
  isLead: boolean;
}

interface PolicyUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: Policy | null;
}

export const PolicyUpdateModal = ({ open, onOpenChange, policy }: PolicyUpdateModalProps) => {
  const [updateType, setUpdateType] = useState<'renewal' | 'endorsement'>('renewal');
  const [newSumInsured, setNewSumInsured] = useState('');
  const [newPremium, setNewPremium] = useState('');
  const [endorsementReason, setEndorsementReason] = useState('');
  const [coInsurerSplits, setCoInsurerSplits] = useState<CoInsurerSplit[]>([
    { insurerId: '1', insurerName: 'Lead Underwriter', percentage: 100, isLead: true }
  ]);
  
  const { toast } = useToast();

  const addCoInsurer = () => {
    setCoInsurerSplits([
      ...coInsurerSplits,
      { 
        insurerId: Date.now().toString(), 
        insurerName: '', 
        percentage: 0, 
        isLead: false 
      }
    ]);
  };

  const removeCoInsurer = (insurerId: string) => {
    if (coInsurerSplits.length > 1) {
      setCoInsurerSplits(coInsurerSplits.filter(split => split.insurerId !== insurerId));
    }
  };

  const updateCoInsurerSplit = (insurerId: string, field: keyof CoInsurerSplit, value: any) => {
    setCoInsurerSplits(splits => 
      splits.map(split => 
        split.insurerId === insurerId 
          ? { ...split, [field]: value }
          : field === 'isLead' && value ? { ...split, isLead: false } : split
      )
    );
  };

  const validateCoInsurerSplits = () => {
    const isValid = validateSplits(coInsurerSplits, 100);
    const totalPercentage = coInsurerSplits.reduce((sum, split) => sum + split.percentage, 0);
    const hasLead = coInsurerSplits.some(split => split.isLead);
    const errors: string[] = [];

    if (!isValid) {
      errors.push('Total percentage must equal 100%');
    }
    if (!hasLead) {
      errors.push('One co-insurer must be designated as lead');
    }

    return {
      isValid: isValid && hasLead,
      totalPercentage,
      hasLead,
      errors
    };
  };

  const handlePolicyUpdate = () => {
    if (!policy) return;

    const splitValidation = validateCoInsurerSplits();
    if (!splitValidation.isValid) {
      toast({
        title: "Validation Error",
        description: splitValidation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    console.log('Processing policy update:', {
      policyId: policy.id,
      updateType,
      originalTerms: {
        client: policy.client,
        type: policy.type,
        sumInsured: policy.sumInsured,
        premium: policy.premium,
        underwriter: policy.underwriter
      },
      newTerms: {
        sumInsured: newSumInsured || policy.sumInsured,
        premium: newPremium || policy.premium,
        endorsementReason: updateType === 'endorsement' ? endorsementReason : null
      },
      coInsurerSplits,
      splitValidation,
      timestamp: new Date().toISOString()
    });

    // Trigger renewal reminder workflow
    if (updateType === 'renewal') {
      console.log('Triggering automated renewal reminder workflow for:', policy.id);
    }

    toast({
      title: `Policy ${updateType} Processed`,
      description: `Policy ${policy.id} has been successfully ${updateType === 'renewal' ? 'renewed' : 'endorsed'}.`,
    });

    onOpenChange(false);
  };

  const splitValidation = validateCoInsurerSplits();

  if (!policy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Policy Updates & Renewals - {policy.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Policy change forms support renewals and endorsements, carrying forward original terms with co-insurer split adjustments.
            </AlertDescription>
          </Alert>

          {/* Original Policy Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Original Policy Terms</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Client:</strong> {policy.client}</div>
              <div><strong>Type:</strong> {policy.type}</div>
              <div><strong>Sum Insured:</strong> {policy.sumInsured}</div>
              <div><strong>Premium:</strong> {policy.premium}</div>
              <div><strong>Period:</strong> {policy.startDate} to {policy.endDate}</div>
              <div><strong>Underwriter:</strong> {policy.underwriter}</div>
            </div>
          </div>

          {/* Update Type Selection */}
          <div>
            <Label htmlFor="updateType">Update Type</Label>
            <Select value={updateType} onValueChange={(value: 'renewal' | 'endorsement') => setUpdateType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select update type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renewal">Policy Renewal</SelectItem>
                <SelectItem value="endorsement">Policy Endorsement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Policy Changes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newSumInsured">New Sum Insured (Optional)</Label>
              <Input 
                id="newSumInsured" 
                placeholder={`Current: ${policy.sumInsured}`}
                value={newSumInsured}
                onChange={(e) => setNewSumInsured(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPremium">New Premium (Optional)</Label>
              <Input 
                id="newPremium" 
                placeholder={`Current: ${policy.premium}`}
                value={newPremium}
                onChange={(e) => setNewPremium(e.target.value)}
              />
            </div>
          </div>

          {updateType === 'endorsement' && (
            <div>
              <Label htmlFor="endorsementReason">Endorsement Reason</Label>
              <Textarea
                id="endorsementReason"
                value={endorsementReason}
                onChange={(e) => setEndorsementReason(e.target.value)}
                placeholder="Specify the reason for this endorsement..."
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* Co-Insurer Split Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Co-Insurer Split Panel</h4>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addCoInsurer}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Co-Insurer
              </Button>
            </div>

            {coInsurerSplits.map((split, index) => (
              <div key={split.insurerId} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex-1">
                  <Input
                    placeholder="Insurer Name"
                    value={split.insurerName}
                    onChange={(e) => updateCoInsurerSplit(split.insurerId, 'insurerName', e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    placeholder="Percentage"
                    value={split.percentage || ''}
                    onChange={(e) => updateCoInsurerSplit(split.insurerId, 'percentage', Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={split.isLead}
                    onChange={(e) => updateCoInsurerSplit(split.insurerId, 'isLead', e.target.checked)}
                  />
                  <label className="text-sm">Lead</label>
                </div>
                {coInsurerSplits.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCoInsurer(split.insurerId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Total Percentage:</span>
              <div className="flex items-center space-x-2">
                <Badge 
                  className={splitValidation.isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                  {splitValidation.totalPercentage.toFixed(2)}%
                </Badge>
                {splitValidation.hasLead && (
                  <Badge className="bg-blue-100 text-blue-800">Lead Designated</Badge>
                )}
              </div>
            </div>

            {!splitValidation.isValid && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {splitValidation.errors.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePolicyUpdate}
              disabled={!splitValidation.isValid}
            >
              Process {updateType === 'renewal' ? 'Renewal' : 'Endorsement'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
