import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RemittanceApprovalModal } from "./RemittanceApprovalModal";
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
  const { toast } = useToast();

  // Enhanced remittance data with granular breakdowns
  const remittances: RemittanceAdvice[] = [
    {
      id: "REM-2024-001",
      underwriter: "AXA Mansard Insurance",
      policyNumber: "POL-2024-001235",
      premium: 5000000,
      commission: 500000, // 10% commission
      adminCharges: 100000, // 2% admin charges
      netRemittance: 4400000, // Premium - Commission - Admin charges
      status: "pending",
      createdDate: "2024-06-20",
      requiresApproval: true // Exceeds threshold
    },
    {
      id: "REM-2024-002",
      underwriter: "AIICO Insurance",
      policyNumber: "POL-2024-001236",
      premium: 750000,
      commission: 75000, // 10% commission
      adminCharges: 15000, // 2% admin charges
      netRemittance: 660000,
      status: "approved",
      createdDate: "2024-06-18",
      approvedBy: "John Administrator",
      requiresApproval: false // Within auto-approval limits
    },
    {
      id: "REM-2024-003",
      underwriter: "Leadway Assurance",
      policyNumber: "POL-2024-001237",
      premium: 12000000,
      commission: 1200000, // 10% commission
      adminCharges: 240000, // 2% admin charges
      netRemittance: 10560000, // Large amount requiring approval
      status: "pending",
      createdDate: "2024-06-21",
      requiresApproval: true
    }
  ];

  const generateRemittanceAdvice = (remittance: RemittanceAdvice) => {
    console.log('Generating Enhanced Remittance Advice PDF:', {
      remittanceId: remittance.id,
      underwriter: remittance.underwriter,
      policyNumber: remittance.policyNumber,
      breakdown: {
        grossPremium: remittance.premium,
        commission: remittance.commission,
        adminCharges: remittance.adminCharges,
        netRemittance: remittance.netRemittance,
        commissionRate: ((remittance.commission / remittance.premium) * 100).toFixed(2) + '%',
        adminRate: ((remittance.adminCharges / remittance.premium) * 100).toFixed(2) + '%'
      },
      timestamp: new Date().toISOString()
    });

    toast({
      title: "Remittance Advice Generated",
      description: `Detailed PDF generated for ${remittance.id} with complete breakdown and calculations.`,
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

  const handleApprovalClick = (remittance: RemittanceAdvice) => {
    setSelectedRemittance(remittance);
    setShowApprovalModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Enhanced Remittance Management</h2>
        <Button>Generate Batch Remittance</Button>
      </div>

      {/* Enhanced Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦16.96M</div>
            <p className="text-xs text-muted-foreground">Pending Approvals</p>
            <p className="text-xs text-gray-500 mt-1">2 high-value remittances</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦40.7M</div>
            <p className="text-xs text-muted-foreground">Approved This Month</p>
            <p className="text-xs text-gray-500 mt-1">Average processing: 2.5 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦1.775M</div>
            <p className="text-xs text-muted-foreground">Commission Retained</p>
            <p className="text-xs text-gray-500 mt-1">10% average rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦355K</div>
            <p className="text-xs text-muted-foreground">Admin Charges</p>
            <p className="text-xs text-gray-500 mt-1">2% average rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automated Remittance with Granular Breakdown & Approvals</CardTitle>
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
                <TableHead>Admin Charges</TableHead>
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
                    <div className="text-xs text-gray-500">
                      ({((remittance.commission / remittance.premium) * 100).toFixed(1)}%)
                    </div>
                  </TableCell>
                  <TableCell className="text-red-600">
                    -₦{remittance.adminCharges.toLocaleString()}
                    <div className="text-xs text-gray-500">
                      ({((remittance.adminCharges / remittance.premium) * 100).toFixed(1)}%)
                    </div>
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
                          onClick={() => handleApprovalClick(remittance)}
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

      <RemittanceApprovalModal
        open={showApprovalModal}
        onOpenChange={setShowApprovalModal}
        selectedRemittance={selectedRemittance}
      />
    </div>
  );
};
