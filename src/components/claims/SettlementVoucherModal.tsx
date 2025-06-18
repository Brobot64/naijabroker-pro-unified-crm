
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { SettlementService } from "@/services/database/settlementService";
import { AuditService } from "@/services/database/auditService";
import { ClaimService } from "@/services/database/claimService";
import { useAuth } from "@/contexts/AuthContext";
import { Claim } from "@/services/database/types";

interface SettlementVoucherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: Claim | null;
  onSuccess?: () => void;
}

export const SettlementVoucherModal = ({ open, onOpenChange, claim, onSuccess }: SettlementVoucherModalProps) => {
  const [settlementData, setSettlementData] = useState({
    agreedAmount: claim?.settlement_amount?.toString() || "",
    settlementType: "full" as const,
    chequeNumber: "",
    chequeDate: "",
    bankName: "",
    dischargingOfficer: "",
    remarks: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateVoucherNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `SV-${timestamp}`;
  };

  const handleSubmit = async () => {
    if (!settlementData.agreedAmount || !settlementData.chequeNumber || !settlementData.chequeDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required settlement details",
        variant: "destructive"
      });
      return;
    }

    if (!claim || !user) {
      toast({
        title: "Error",
        description: "Missing claim or user information",
        variant: "destructive"
      });
      return;
    }

    const agreedAmount = parseFloat(settlementData.agreedAmount);
    if (agreedAmount > claim.estimated_loss) {
      toast({
        title: "Settlement Validation Error",
        description: "Settlement amount cannot exceed the estimated loss amount",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create settlement voucher
      const voucherNumber = generateVoucherNumber();
      await SettlementService.createSettlementVoucher({
        voucher_number: voucherNumber,
        claim_id: claim.id,
        policy_number: claim.policy_number,
        client_name: claim.client_name,
        agreed_amount: agreedAmount,
        settlement_type: settlementData.settlementType,
        cheque_number: settlementData.chequeNumber,
        cheque_date: settlementData.chequeDate,
        bank_name: settlementData.bankName,
        discharging_officer: settlementData.dischargingOfficer,
        remarks: settlementData.remarks,
        created_by: user.id
      });

      // Update claim status and settlement amount
      await ClaimService.update(claim.id, {
        settlement_amount: agreedAmount,
        status: 'settled'
      });

      // Create audit log
      await AuditService.log({
        user_id: user.id,
        action: 'SETTLEMENT_VOUCHER_CREATED',
        resource_type: 'settlement_voucher',
        resource_id: claim.id,
        new_values: {
          voucher_number: voucherNumber,
          agreed_amount: agreedAmount,
          settlement_type: settlementData.settlementType,
          cheque_number: settlementData.chequeNumber
        },
        severity: 'high',
        metadata: {
          claim_id: claim.id,
          policy_number: claim.policy_number
        }
      });

      toast({
        title: "Settlement Processed Successfully",
        description: `Settlement voucher ${voucherNumber} generated for ₦${agreedAmount.toLocaleString()}. Discharge voucher can now be issued.`,
      });

      if (onSuccess) onSuccess();
      onOpenChange(false);

    } catch (error) {
      console.error('Settlement processing error:', error);
      toast({
        title: "Settlement Processing Failed",
        description: "Failed to process settlement. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!claim) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settlement Voucher Processing</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Claim Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Claim ID:</span>
                <span>{claim.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Policy Number:</span>
                <span>{claim.policy_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Insured:</span>
                <span>{claim.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Claim Type:</span>
                <span>{claim.claim_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Estimated Loss:</span>
                <span className="font-semibold">₦{claim.estimated_loss.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Settlement Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agreedAmount">Agreed Settlement Amount (₦) *</Label>
                <Input
                  id="agreedAmount"
                  type="number"
                  value={settlementData.agreedAmount}
                  onChange={(e) => setSettlementData({...settlementData, agreedAmount: e.target.value})}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ₦{claim.estimated_loss.toLocaleString()}
                </p>
              </div>

              <div>
                <Label htmlFor="settlementType">Settlement Type</Label>
                <select
                  id="settlementType"
                  value={settlementData.settlementType}
                  onChange={(e) => setSettlementData({...settlementData, settlementType: e.target.value as any})}
                  className="w-full p-2 border rounded"
                >
                  <option value="full">Full Settlement</option>
                  <option value="partial">Partial Settlement</option>
                  <option value="final">Final Settlement</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chequeNumber">Cheque Number *</Label>
                <Input
                  id="chequeNumber"
                  value={settlementData.chequeNumber}
                  onChange={(e) => setSettlementData({...settlementData, chequeNumber: e.target.value})}
                  placeholder="CHQ-XXXXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="chequeDate">Cheque Date *</Label>
                <Input
                  id="chequeDate"
                  type="date"
                  value={settlementData.chequeDate}
                  onChange={(e) => setSettlementData({...settlementData, chequeDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bankName">Issuing Bank</Label>
              <Input
                id="bankName"
                value={settlementData.bankName}
                onChange={(e) => setSettlementData({...settlementData, bankName: e.target.value})}
                placeholder="Bank name"
              />
            </div>

            <div>
              <Label htmlFor="dischargingOfficer">Discharging Officer</Label>
              <Input
                id="dischargingOfficer"
                value={settlementData.dischargingOfficer}
                onChange={(e) => setSettlementData({...settlementData, dischargingOfficer: e.target.value})}
                placeholder="Officer name and designation"
              />
            </div>

            <div>
              <Label htmlFor="remarks">Settlement Remarks</Label>
              <Textarea
                id="remarks"
                value={settlementData.remarks}
                onChange={(e) => setSettlementData({...settlementData, remarks: e.target.value})}
                placeholder="Additional notes or conditions"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800">Settlement Confirmation</h4>
            <p className="text-sm text-yellow-700 mt-1">
              This action will create an immutable settlement record. Please verify all details before proceeding.
              Once processed, this settlement cannot be modified without proper authorization.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Process Settlement"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
