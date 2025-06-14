
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { workflowManager } from "@/utils/workflowManager";

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
}

export const RemittanceManagement = () => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRemittance, setSelectedRemittance] = useState<RemittanceAdvice | null>(null);
  const [approvalComments, setApprovalComments] = useState("");

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
      createdDate: "2024-06-20"
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
      approvedBy: "John Administrator"
    }
  ];

  const handleApproval = (remittance: RemittanceAdvice, action: 'approve' | 'reject') => {
    const requiresApproval = workflowManager.requiresApproval('payments', remittance.netRemittance, 'BrokerAdmin');
    
    if (requiresApproval && action === 'approve') {
      console.log(`Remittance ${remittance.id} approved with comments: ${approvalComments}`);
      // Trigger payment process
    } else if (action === 'reject') {
      console.log(`Remittance ${remittance.id} rejected with comments: ${approvalComments}`);
    }
    
    setShowApprovalModal(false);
    setSelectedRemittance(null);
    setApprovalComments("");
  };

  const generateRemittanceAdvice = (remittance: RemittanceAdvice) => {
    console.log("Generating remittance advice PDF for:", remittance.id);
    // Generate detailed breakdown PDF
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
          <DialogTitle>Remittance Approval</DialogTitle>
        </DialogHeader>
        {selectedRemittance && (
          <div className="space-y-4">
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
                  <span>-₦{selectedRemittance.commission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin Charges:</span>
                  <span>-₦{selectedRemittance.adminCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Net Remittance:</span>
                  <span>₦{selectedRemittance.netRemittance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="comments">Approval Comments</Label>
              <Textarea
                id="comments"
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Add comments for this approval..."
                className="min-h-[100px]"
              />
            </div>

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
                Approve
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
        <h2 className="text-2xl font-bold">Remittance Management</h2>
        <Button>Generate Remittance Batch</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦12.5M</div>
            <p className="text-xs text-muted-foreground">Pending Remittances</p>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Remittance Advice</CardTitle>
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
                    <Badge className={getStatusColor(remittance.status)}>
                      {remittance.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateRemittanceAdvice(remittance)}
                      >
                        PDF
                      </Button>
                      {remittance.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedRemittance(remittance);
                            setShowApprovalModal(true);
                          }}
                        >
                          Approve
                        </Button>
                      )}
                      {remittance.status === 'approved' && (
                        <Button size="sm" variant="outline">
                          Send Payment
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
