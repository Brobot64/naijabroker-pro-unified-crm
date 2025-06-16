
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { workflowManager } from "@/utils/workflowManager";
import { adminService } from "@/services/adminService";

interface Claim {
  id: string;
  policyNumber: string;
  client: string;
  type: string;
  settlementAmount?: number;
  settlementDate?: string;
}

interface DischargeVoucherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: Claim | null;
}

export const DischargeVoucherModal = ({ open, onOpenChange, claim }: DischargeVoucherModalProps) => {
  const [voucherData, setVoucherData] = useState({
    voucherNumber: `DV-${Date.now()}`,
    underwriterName: "",
    underwriterCode: "",
    totalVoucherAmount: claim?.settlementAmount?.toString() || "",
    chequeDate: "",
    dischargeDate: new Date().toISOString().split('T')[0],
    authorizedBy: "",
    remarks: ""
  });
  const [approvalChecks, setApprovalChecks] = useState({
    settlementApproved: false,
    documentsComplete: false,
    authorizationValid: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validateApprovals = () => {
    if (!claim) return false;

    // Check if settlement is approved and amount is within limits
    const requiresApproval = workflowManager.requiresApproval('claims', claim.settlementAmount || 0, 'Underwriter');
    
    console.log('Discharge voucher approval validation:', {
      claimId: claim.id,
      settlementAmount: claim.settlementAmount,
      requiresApproval,
      approvalChecks,
      nextApprover: requiresApproval ? workflowManager.getNextApprover('claims', claim.settlementAmount || 0, 'Underwriter') : null
    });

    return !requiresApproval || approvalChecks.settlementApproved;
  };

  const handleIssueVoucher = async () => {
    if (!validateApprovals()) {
      toast({
        title: "Approval Required",
        description: "Discharge voucher cannot be issued without proper approvals",
        variant: "destructive"
      });
      return;
    }

    if (!voucherData.underwriterName || !voucherData.authorizedBy) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required voucher details",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Issuing discharge voucher with full audit trail:', {
        claimId: claim?.id,
        voucherNumber: voucherData.voucherNumber,
        underwriter: voucherData.underwriterName,
        voucherAmount: parseFloat(voucherData.totalVoucherAmount),
        dischargeDate: voucherData.dischargeDate,
        authorizedBy: voucherData.authorizedBy,
        timestamp: new Date().toISOString(),
        approvalStatus: approvalChecks
      });

      // Log discharge voucher issuance for immutable audit trail
      adminService.logAction(
        'DISCHARGE_VOUCHER_ISSUED',
        'Claims Settlement',
        `Discharge voucher ${voucherData.voucherNumber} issued for claim ${claim?.id}. Amount: ₦${parseFloat(voucherData.totalVoucherAmount).toLocaleString()}`,
        'critical'
      );

      // Log underwriter discharge details
      adminService.logAction(
        'UNDERWRITER_DISCHARGE_PROCESSED',
        'Underwriter Relations',
        `Discharge voucher issued to ${voucherData.underwriterName} (${voucherData.underwriterCode}) - Authorized by ${voucherData.authorizedBy}`,
        'high'
      );

      // Generate notification to underwriter
      const notification = workflowManager.generateNotification('claim_update', {
        claimNumber: claim?.id,
        clientEmail: 'underwriter@example.com', // In real app, get from underwriter data
        status: 'Discharge Voucher Issued',
        additionalInfo: `Voucher ${voucherData.voucherNumber} ready for collection. Amount: ₦${parseFloat(voucherData.totalVoucherAmount).toLocaleString()}`
      });

      console.log('Discharge voucher notification:', notification);

      toast({
        title: "Discharge Voucher Issued Successfully",
        description: `Voucher ${voucherData.voucherNumber} has been generated and logged. Underwriter notification sent.`,
      });

      onOpenChange(false);

    } catch (error) {
      toast({
        title: "Voucher Issuance Failed",
        description: "Failed to issue discharge voucher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!claim) return null;

  const canIssueVoucher = validateApprovals() && approvalChecks.documentsComplete && approvalChecks.authorizationValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Underwriter Discharge Voucher</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Claim Settlement Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Claim ID:</span>
                <span>{claim.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Policy Number:</span>
                <span>{claim.policyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Insured:</span>
                <span>{claim.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Settlement Amount:</span>
                <span className="font-semibold text-green-600">₦{claim.settlementAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Settlement Date:</span>
                <span>{claim.settlementDate}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Approval & Authorization Checks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Settlement Approved by Authorized Officer</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={approvalChecks.settlementApproved}
                    onChange={(e) => setApprovalChecks({...approvalChecks, settlementApproved: e.target.checked})}
                    className="rounded"
                  />
                  <Badge className={approvalChecks.settlementApproved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {approvalChecks.settlementApproved ? "Approved" : "Required"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>All Settlement Documents Complete</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={approvalChecks.documentsComplete}
                    onChange={(e) => setApprovalChecks({...approvalChecks, documentsComplete: e.target.checked})}
                    className="rounded"
                  />
                  <Badge className={approvalChecks.documentsComplete ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {approvalChecks.documentsComplete ? "Complete" : "Required"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Authorization for Discharge Valid</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={approvalChecks.authorizationValid}
                    onChange={(e) => setApprovalChecks({...approvalChecks, authorizationValid: e.target.checked})}
                    className="rounded"
                  />
                  <Badge className={approvalChecks.authorizationValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {approvalChecks.authorizationValid ? "Valid" : "Required"}
                  </Badge>
                </div>
              </div>

              {!canIssueVoucher && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Approval Required</p>
                    <p className="text-red-700 text-sm">
                      All approval checks must be completed before discharge voucher can be issued.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Discharge Voucher Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voucherNumber">Voucher Number</Label>
                <Input
                  id="voucherNumber"
                  value={voucherData.voucherNumber}
                  onChange={(e) => setVoucherData({...voucherData, voucherNumber: e.target.value})}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="totalVoucherAmount">Total Voucher Amount (₦)</Label>
                <Input
                  id="totalVoucherAmount"
                  value={voucherData.totalVoucherAmount}
                  onChange={(e) => setVoucherData({...voucherData, totalVoucherAmount: e.target.value})}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="underwriterName">Underwriter Name *</Label>
                <Input
                  id="underwriterName"
                  value={voucherData.underwriterName}
                  onChange={(e) => setVoucherData({...voucherData, underwriterName: e.target.value})}
                  placeholder="Underwriter company name"
                />
              </div>

              <div>
                <Label htmlFor="underwriterCode">Underwriter Code</Label>
                <Input
                  id="underwriterCode"
                  value={voucherData.underwriterCode}
                  onChange={(e) => setVoucherData({...voucherData, underwriterCode: e.target.value})}
                  placeholder="UW-CODE"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chequeDate">Cheque Date</Label>
                <Input
                  id="chequeDate"
                  type="date"
                  value={voucherData.chequeDate}
                  onChange={(e) => setVoucherData({...voucherData, chequeDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="dischargeDate">Discharge Date</Label>
                <Input
                  id="dischargeDate"
                  type="date"
                  value={voucherData.dischargeDate}
                  onChange={(e) => setVoucherData({...voucherData, dischargeDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="authorizedBy">Authorized By *</Label>
              <Input
                id="authorizedBy"
                value={voucherData.authorizedBy}
                onChange={(e) => setVoucherData({...voucherData, authorizedBy: e.target.value})}
                placeholder="Name and designation of authorizing officer"
              />
            </div>

            <div>
              <Label htmlFor="remarks">Discharge Remarks</Label>
              <textarea
                id="remarks"
                value={voucherData.remarks}
                onChange={(e) => setVoucherData({...voucherData, remarks: e.target.value})}
                placeholder="Additional notes or special instructions"
                rows={3}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {canIssueVoucher && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800">Ready to Issue</h4>
              <p className="text-sm text-green-700 mt-1">
                All approval requirements have been met. This discharge voucher will be logged as an immutable record.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleIssueVoucher} 
            disabled={!canIssueVoucher || isProcessing}
          >
            {isProcessing ? "Issuing..." : "Issue Discharge Voucher"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
