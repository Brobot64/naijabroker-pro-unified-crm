
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClaimRegistrationModal } from "./ClaimRegistrationModal";
import { SettlementVoucherModal } from "./SettlementVoucherModal";
import { DischargeVoucherModal } from "./DischargeVoucherModal";
import { useToast } from "@/hooks/use-toast";
import { workflowManager } from "@/utils/workflowManager";
import { adminService } from "@/services/adminService";

interface Claim {
  id: string;
  policyNumber: string;
  client: string;
  type: string;
  reportedDate: string;
  claimAmount: string;
  estimatedLoss: number;
  status: 'reported' | 'investigating' | 'approved' | 'settled' | 'rejected';
  adjuster?: string;
  lastUpdate: string;
  documents: string[];
  investigationNotes?: string;
  settlementAmount?: number;
  settlementDate?: string;
  dischargeVoucherIssued?: boolean;
}

export const ClaimsManagement = () => {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const { toast } = useToast();

  const claims: Claim[] = [
    {
      id: "CLM-2024-001",
      policyNumber: "POL-2024-001234",
      client: "Dangote Industries Ltd",
      type: "Fire Damage",
      reportedDate: "2024-06-01",
      claimAmount: "₦5,000,000",
      estimatedLoss: 5000000,
      status: "investigating",
      adjuster: "John Adjuster",
      lastUpdate: "2024-06-10",
      documents: ["fire_report.pdf", "damage_photos.zip"],
      investigationNotes: "Site inspection completed. Cause under investigation."
    },
    {
      id: "CLM-2024-002",
      policyNumber: "POL-2024-001235",
      client: "GTBank Plc",
      type: "Cyber Security",
      reportedDate: "2024-05-25",
      claimAmount: "₦2,500,000",
      estimatedLoss: 2500000,
      status: "approved",
      adjuster: "Mary Examiner",
      lastUpdate: "2024-06-08",
      documents: ["cyber_incident_report.pdf"],
      settlementAmount: 2200000,
      settlementDate: "2024-06-08"
    },
    {
      id: "CLM-2024-003",
      policyNumber: "POL-2024-001236",
      client: "First Bank Plc",
      type: "Motor Accident",
      reportedDate: "2024-06-05",
      claimAmount: "₦850,000",
      estimatedLoss: 850000,
      status: "settled",
      adjuster: "David Inspector",
      lastUpdate: "2024-06-12",
      documents: ["police_report.pdf", "vehicle_photos.zip"],
      settlementAmount: 800000,
      settlementDate: "2024-06-12",
      dischargeVoucherIssued: true
    },
  ];

  const assignInvestigation = (claim: Claim) => {
    console.log('Assigning investigation with compliance workflow:', {
      claimId: claim.id,
      estimatedLoss: claim.estimatedLoss,
      requiresApproval: workflowManager.requiresApproval('claims', claim.estimatedLoss, 'Compliance'),
      nextApprover: workflowManager.getNextApprover('claims', claim.estimatedLoss, 'Compliance')
    });

    // Generate investigation assignment notification
    const notification = workflowManager.generateNotification('claim_update', {
      claimNumber: claim.id,
      clientEmail: 'client@example.com',
      status: 'Under Investigation',
      additionalInfo: 'Investigation has been assigned to ' + claim.adjuster
    });

    console.log('Investigation assignment notification:', notification);

    // Log the assignment for compliance audit
    adminService.logAction(
      'CLAIM_INVESTIGATION_ASSIGNED',
      'Claims Management',
      `Investigation assigned for claim ${claim.id} to ${claim.adjuster}`,
      'medium'
    );

    toast({
      title: "Investigation Assigned",
      description: `Investigation for claim ${claim.id} has been assigned to ${claim.adjuster}`,
    });
  };

  const processSettlement = (claim: Claim) => {
    if (!claim.settlementAmount) {
      toast({
        title: "Settlement Required",
        description: "Please complete settlement processing first",
        variant: "destructive"
      });
      return;
    }

    setSelectedClaim(claim);
    setShowSettlementModal(true);
  };

  const issueDischargeVoucher = (claim: Claim) => {
    if (claim.status !== 'settled' || !claim.settlementAmount) {
      toast({
        title: "Settlement Required",
        description: "Claim must be settled before discharge voucher can be issued",
        variant: "destructive"
      });
      return;
    }

    if (claim.dischargeVoucherIssued) {
      toast({
        title: "Already Issued",
        description: "Discharge voucher has already been issued for this claim",
        variant: "destructive"
      });
      return;
    }

    // Check approval requirements for discharge
    const requiresApproval = workflowManager.requiresApproval('claims', claim.settlementAmount, 'Underwriter');
    
    if (requiresApproval) {
      console.log('Discharge voucher requires approval:', {
        claimId: claim.id,
        settlementAmount: claim.settlementAmount,
        nextApprover: workflowManager.getNextApprover('claims', claim.settlementAmount, 'Underwriter')
      });
      
      toast({
        title: "Approval Required",
        description: "Discharge voucher requires senior approval due to settlement amount",
        variant: "destructive"
      });
      return;
    }

    setSelectedClaim(claim);
    setShowDischargeModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "settled":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "investigating":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "reported":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Enhanced Claims Management</h1>
        <Button onClick={() => setShowRegistrationModal(true)}>
          Register New Claim
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Active Claims</p>
            <p className="text-xs text-gray-500 mt-1">₦8.35M total exposure</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Under Investigation</p>
            <p className="text-xs text-gray-500 mt-1">Avg: 15 days pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦3.0M</div>
            <p className="text-xs text-muted-foreground">Settled This Month</p>
            <p className="text-xs text-gray-500 mt-1">85% settlement rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Discharge Vouchers</p>
            <p className="text-xs text-gray-500 mt-1">Pending underwriter approval</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active-claims" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active-claims">Active Claims</TabsTrigger>
          <TabsTrigger value="settlements">Settlements & Discharge</TabsTrigger>
        </TabsList>

        <TabsContent value="active-claims">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Claims Register with Investigation Tracking</CardTitle>
                <div className="flex space-x-2">
                  <Input placeholder="Search claims..." className="w-64" />
                  <Button variant="outline">Filter</Button>
                  <Button variant="outline">Export Audit Report</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Policy Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Estimated Loss</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Adjuster</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.id}</TableCell>
                      <TableCell>{claim.policyNumber}</TableCell>
                      <TableCell>{claim.client}</TableCell>
                      <TableCell>{claim.type}</TableCell>
                      <TableCell className="font-semibold">₦{claim.estimatedLoss.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                      </TableCell>
                      <TableCell>{claim.adjuster || 'Unassigned'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{claim.documents.length} files</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          {claim.status === 'reported' && (
                            <Button 
                              size="sm"
                              onClick={() => assignInvestigation(claim)}
                            >
                              Assign Investigation
                            </Button>
                          )}
                          {claim.status === 'approved' && (
                            <Button 
                              size="sm"
                              onClick={() => processSettlement(claim)}
                            >
                              Process Settlement
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
        </TabsContent>

        <TabsContent value="settlements">
          <Card>
            <CardHeader>
              <CardTitle>Settlement Vouchers & Discharge Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Settlement Amount</TableHead>
                    <TableHead>Settlement Date</TableHead>
                    <TableHead>Discharge Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.filter(claim => claim.status === 'approved' || claim.status === 'settled').map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.id}</TableCell>
                      <TableCell>{claim.client}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₦{claim.settlementAmount?.toLocaleString() || 'Pending'}
                      </TableCell>
                      <TableCell>{claim.settlementDate || 'Pending'}</TableCell>
                      <TableCell>
                        <Badge className={claim.dischargeVoucherIssued ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {claim.dischargeVoucherIssued ? 'Issued' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {!claim.dischargeVoucherIssued && claim.status === 'settled' && (
                            <Button 
                              size="sm"
                              onClick={() => issueDischargeVoucher(claim)}
                            >
                              Issue Discharge Voucher
                            </Button>
                          )}
                          {claim.dischargeVoucherIssued && (
                            <Button size="sm" variant="outline">
                              View Voucher
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
        </TabsContent>
      </Tabs>

      <ClaimRegistrationModal
        open={showRegistrationModal}
        onOpenChange={setShowRegistrationModal}
      />

      <SettlementVoucherModal
        open={showSettlementModal}
        onOpenChange={setShowSettlementModal}
        claim={selectedClaim}
      />

      <DischargeVoucherModal
        open={showDischargeModal}
        onOpenChange={setShowDischargeModal}
        claim={selectedClaim}
      />
    </div>
  );
};
