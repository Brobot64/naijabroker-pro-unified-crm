
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SettlementService } from "@/services/database/settlementService";
import { AuditService } from "@/services/database/auditService";
import { useAuth } from "@/contexts/AuthContext";
import { Claim, SettlementVoucher } from "@/services/database/types";

interface DischargeVoucherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: Claim | null;
  onSuccess?: () => void;
}

export const DischargeVoucherModal = ({ open, onOpenChange, claim, onSuccess }: DischargeVoucherModalProps) => {
  const [settlementVoucher, setSettlementVoucher] = useState<SettlementVoucher | null>(null);
  const [dischargeData, setDischargeData] = useState({
    underwriter: "",
    dischargeDate: new Date().toISOString().split('T')[0],
    notes: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (claim && open) {
      loadSettlementVoucher();
    }
  }, [claim, open]);

  const loadSettlementVoucher = async () => {
    if (!claim) return;
    
    setLoading(true);
    try {
      const vouchers = await SettlementService.getSettlementVouchers();
      const voucher = vouchers.find(v => v.claim_id === claim.id);
      setSettlementVoucher(voucher || null);
    } catch (error) {
      console.error('Failed to load settlement voucher:', error);
      toast({
        title: "Error",
        description: "Failed to load settlement voucher details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDischargeNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `DV-${timestamp}`;
  };

  const handleSubmit = async () => {
    if (!dischargeData.underwriter || !dischargeData.dischargeDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!claim || !settlementVoucher || !user) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const dischargeNumber = generateDischargeNumber();

      // Create discharge voucher
      await SettlementService.createDischargeVoucher({
        voucher_number: dischargeNumber,
        settlement_voucher_id: settlementVoucher.id,
        claim_id: claim.id,
        underwriter: dischargeData.underwriter,
        voucher_amount: settlementVoucher.agreed_amount,
        discharge_date: dischargeData.dischargeDate,
        created_by: user.id,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        notes: dischargeData.notes
      });

      // Create audit log
      await AuditService.log({
        user_id: user.id,
        action: 'DISCHARGE_VOUCHER_CREATED',
        resource_type: 'discharge_voucher',
        resource_id: claim.id,
        new_values: {
          voucher_number: dischargeNumber,
          settlement_voucher_id: settlementVoucher.id,
          underwriter: dischargeData.underwriter,
          voucher_amount: settlementVoucher.agreed_amount
        },
        severity: 'high',
        metadata: {
          claim_id: claim.id,
          policy_number: claim.policy_number,
          settlement_voucher_number: settlementVoucher.voucher_number
        }
      });

      toast({
        title: "Discharge Voucher Created",
        description: `Discharge voucher ${dischargeNumber} has been successfully created for ₦${settlementVoucher.agreed_amount.toLocaleString()}`,
      });

      if (onSuccess) onSuccess();
      onOpenChange(false);

    } catch (error) {
      console.error('Discharge voucher creation error:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create discharge voucher. Please try again.",
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
          <DialogTitle>Create Discharge Voucher</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading settlement details...</span>
          </div>
        ) : !settlementVoucher ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No settlement voucher found for this claim.</p>
            <p className="text-sm text-gray-400 mt-2">
              A settlement voucher must be processed before creating a discharge voucher.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settlement Voucher Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Voucher Number:</span>
                  <Badge variant="outline">{settlementVoucher.voucher_number}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Claim Number:</span>
                  <span>{claim.claim_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Client:</span>
                  <span>{settlementVoucher.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Settlement Amount:</span>
                  <span className="font-bold text-green-600">₦{settlementVoucher.agreed_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Settlement Type:</span>
                  <Badge>{settlementVoucher.settlement_type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Cheque Number:</span>
                  <span>{settlementVoucher.cheque_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Cheque Date:</span>
                  <span>{new Date(settlementVoucher.cheque_date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Discharge Voucher Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="underwriter">Underwriter Name *</Label>
                  <Input
                    id="underwriter"
                    value={dischargeData.underwriter}
                    onChange={(e) => setDischargeData({...dischargeData, underwriter: e.target.value})}
                    placeholder="Enter underwriter name"
                  />
                </div>

                <div>
                  <Label htmlFor="dischargeDate">Discharge Date *</Label>
                  <Input
                    id="dischargeDate"
                    type="date"
                    value={dischargeData.dischargeDate}
                    onChange={(e) => setDischargeData({...dischargeData, dischargeDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={dischargeData.notes}
                  onChange={(e) => setDischargeData({...dischargeData, notes: e.target.value})}
                  placeholder="Enter any additional notes or instructions"
                  rows={3}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800">Discharge Authorization</h4>
              <p className="text-sm text-blue-700 mt-1">
                This discharge voucher authorizes the release of funds as per the settlement agreement.
                The voucher will be recorded in the audit trail for compliance purposes.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {settlementVoucher && (
            <Button onClick={handleSubmit} disabled={isProcessing || loading}>
              {isProcessing ? "Creating..." : "Create Discharge Voucher"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
