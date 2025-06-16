
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { workflowManager } from "@/utils/workflowManager";
import { useToast } from "@/hooks/use-toast";

interface RemittanceAdvice {
  id: string;
  underwriter: string;
  policyNumber: string;
  premium: number;
  commission: number;
  adminCharges: number;
  netRemittance: number;
  status: 'pending' | 'approved' | 'sent' | 'received';
  createdDate: string;
  approvedBy?: string;
  requiresApproval: boolean;
}

interface RemittanceApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRemittance: RemittanceAdvice | null;
}

export const RemittanceApprovalModal = ({ 
  open, 
  onOpenChange, 
  selectedRemittance 
}: RemittanceApprovalModalProps) => {
  const [approvalComments, setApprovalComments] = useState("");
  const { toast } = useToast();

  const handleApproval = (action: 'approve' | 'reject') => {
    if (!selectedRemittance) return;

    const requiresApproval = workflowManager.requiresApproval(
      'remittance', 
      selectedRemittance.netRemittance, 
      'BrokerAdmin'
    );
    
    if (action === 'approve') {
      console.log('Remittance Approval Process:', {
        remittanceId: selectedRemittance.id,
        amount: selectedRemittance.netRemittance,
        requiresApproval,
        comments: approvalComments,
        timestamp: new Date().toISOString(),
        approver: 'BrokerAdmin'
      });
      
      // Generate notification for underwriter
      const notification = workflowManager.generateNotification('remittance_ready', {
        remittanceId: selectedRemittance.id,
        amount: selectedRemittance.netRemittance,
        underwriterEmail: 'underwriter@example.com'
      });
      
      console.log('Generated notification:', notification);
      
      toast({
        title: "Remittance Approved",
        description: `Remittance ${selectedRemittance.id} approved. Underwriter notified automatically.`,
      });
    } else if (action === 'reject') {
      console.log('Remittance Rejection:', {
        remittanceId: selectedRemittance.id,
        reason: approvalComments,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Remittance Rejected",
        description: `Remittance ${selectedRemittance.id} has been rejected.`,
        variant: "destructive",
      });
    }
    
    onOpenChange(false);
    setApprovalComments("");
  };

  if (!selectedRemittance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Remittance Approval - Enhanced Workflow</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {selectedRemittance.requiresApproval && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This remittance exceeds approval threshold (₦{selectedRemittance.netRemittance.toLocaleString()}) and requires senior authorization.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold">{selectedRemittance.underwriter}</h4>
            <p className="text-sm text-gray-600">Policy: {selectedRemittance.policyNumber}</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Gross Premium:</span>
                <span>₦{selectedRemittance.premium.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Commission:</span>
                <span className="text-red-600">-₦{selectedRemittance.commission.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Admin Charges:</span>
                <span className="text-red-600">-₦{selectedRemittance.adminCharges.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1">
                <span>Net Remittance:</span>
                <span className="text-green-600">₦{selectedRemittance.netRemittance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="comments">Approval Comments*</Label>
            <Textarea
              id="comments"
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              placeholder="Add detailed comments for this approval decision..."
              className="min-h-[100px]"
            />
          </div>

          {!selectedRemittance.requiresApproval && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                This remittance is within auto-approval limits but still requires confirmation.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleApproval('reject')}
              disabled={!approvalComments.trim()}
            >
              Reject
            </Button>
            <Button 
              onClick={() => handleApproval('approve')}
              disabled={!approvalComments.trim()}
            >
              Approve & Process
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
