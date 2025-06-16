
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export const RemittanceManagement = () => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRemittance, setSelectedRemittance] = useState<RemittanceAdvice | null>(null);
  const [approvalComments, setApprovalComments] = useState("");
  const { toast } = useToast();

  const remittances: RemittanceAdvice[] = [
    {
      id: "REM-2024-001",
      underwriter: "AXA Mansard Insurance",
      policyNumber: "POL-2024-001235",
      premium: 5000000,
      commission: 500000,
      adminCharges: 100000,
      netRemittance: 4400000,
      status: "pending",
      createdDate: "2024-06-20",
      requiresApproval: true
    },
    {
      id: "REM-2024-002",
      underwriter: "AIICO Insurance",
      policyNumber: "POL-2024-001236",
      premium: 750000,
      commission: 75000,
      adminCharges: 15000,
      netRemittance: 660000,
      status: "approved",
      createdDate: "2024-06-18",
      approvedBy: "John Administrator",
      requiresApproval: false
    }
  ];

  const handleApproval = (remittance: RemittanceAdvice, action: 'approve' | 'reject') => {
    const requiresApproval = workflowManager.requiresApproval('remittance', remittance.netRemittance, 'BrokerAdmin');
    
    if (requiresApproval && action === 'approve') {
      console.log(`Remittance ${remittance.id} approved with comments: ${approvalComments}`);
      
      // Generate notification for underwriter
      const notification = workflowManager.generateNotification('remittance_ready', {
        remittanceId: remittance.id,
        amount: remittance.netRemittance,
        underwriterEmail: 'underwriter@example.com'
      });
      
      toast({
        title: "Remittance Approved",
        description: `Remittance ${remittance.id} has been approved and underwriter notified.`,
      });
    } else if (action === 'reject') {
      console.log(`Remittance ${remittance.id} rejected with comments: ${approvalComments}`);
      toast({
        title: "Remittance Rejected",
        description: `Remittance ${remittance.id} has been rejected.`,
        variant: "destructive",
      });
    }
    
    setShowApprovalModal(false);
    setSelectedRemittance(null);
    setApprovalComments("");
  };

  const generateRemittanceAdvice = (remittance: RemittanceAdvice) => {
    console.log("Generating detailed remittance advice PDF for:", remittance.id);
    toast({
      title: "PDF Generated",
      description: "Remittance advice PDF has been generated with detailed breakdown.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const ApprovalModal = () => (
    <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Remittance Approval - Enhanced Workflow</DialogTitle>
        </DialogHeader>
        {selectedRemittance && (
          <div className="space-y-4">
            {selectedRemittance.requiresApproval && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This remittance exceeds approval threshold and requires senior authorization.
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold">{selectedRemittance.underwriter}</h4>
              <p className="text-sm text-gray-600">Policy: {selectedRemittance.policyNumber}</p>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Premium:</span>
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
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleApproval(selectedRemittance, 'reject')}
              >
                Reject
              </Button>
              <Button 
                onClick={() => handleApproval(selectedRemittance, 'approve')}
              >
                Approve & Process
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Enhanced Remittance Management</h2>
        <Button>Generate Batch Remittance</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦12.5M</div>
            <p className="text-xs text-muted-foreground">Pending Approvals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦40.7M</div>
            <p className="text-xs text-muted-foreground">Approved This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦4.5M</div>
            <p className="text-xs text-muted-foreground">Commission Retained</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦28.2M</div>
            <p className="text-xs text-muted-foreground">Automated Remittances</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automated Remittance Advice with Approval Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Remittance ID</TableHead>
                <TableHead>Underwriter</TableHead>
                <TableHead>Policy Number</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Net Remittance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {remittances.map((remittance) => (
                <TableRow key={remittance.id}>
                  <TableCell className="font-medium">{remittance.id}</TableCell>
                  <TableCell>{remittance.underwriter}</TableCell>
                  <TableCell>{remittance.policyNumber}</TableCell>
                  <TableCell>₦{remittance.premium.toLocaleString()}</TableCell>
                  <TableCell className="text-red-600">
                    -₦{remittance.commission.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ₦{remittance.netRemittance.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <Badge className={getStatusColor(remittance.status)}>
                        {remittance.status}
                      </Badge>
                      {remittance.requiresApproval && (
                        <span className="text-xs text-orange-600">Requires Approval</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateRemittanceAdvice(remittance)}
                      >
                        Generate PDF
                      </Button>
                      {remittance.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedRemittance(remittance);
                            setShowApprovalModal(true);
                          }}
                        >
                          {remittance.requiresApproval ? 'Review & Approve' : 'Quick Approve'}
                        </Button>
                      )}
                      {remittance.status === 'approved' && (
                        <Button size="sm" variant="outline">
                          Process Payment
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ApprovalModal />
    </div>
  );
};
