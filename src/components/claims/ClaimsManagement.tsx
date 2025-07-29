
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ClaimService } from "@/services/database/claimService";
import { SettlementVoucherModal } from "./SettlementVoucherModal";
import { DischargeVoucherModal } from "./DischargeVoucherModal";
import { ClaimsWorkflowTracker } from "./ClaimsWorkflowTracker";
import { ClaimEditModal } from "./ClaimEditModal";
import { Claim } from "@/services/database/types";
import { Plus, Search, FileText, CheckCircle, AlertCircle, Activity, Eye, Edit, Trash2, Filter, RefreshCw } from "lucide-react";

export const ClaimsManagement = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [selectedClaimForWorkflow, setSelectedClaimForWorkflow] = useState<Claim | null>(null);
  const [selectedClaimForEdit, setSelectedClaimForEdit] = useState<Claim | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const statusOptions = ["registered", "investigating", "assessed", "approved", "settled", "rejected", "closed"];
  const stageOptions = ["registered", "investigation", "documents", "approval", "settled"];

  const loadClaims = async () => {
    try {
      setLoading(true);
      const claimsData = await ClaimService.getAll();
      setClaims(claimsData);
    } catch (error) {
      console.error('Failed to load claims:', error);
      toast({
        title: "Error",
        description: "Failed to load claims data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
    
    // Listen for new claims created
    const handleClaimCreated = () => {
      loadClaims();
    };
    
    window.addEventListener('claimCreated', handleClaimCreated);
    return () => window.removeEventListener('claimCreated', handleClaimCreated);
  }, []);

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.policy_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesStage = stageFilter === 'all' || claim.status === stageFilter; // Using status as stage for now
    
    return matchesSearch && matchesStatus && matchesStage;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      registered: "bg-blue-100 text-blue-800",
      investigating: "bg-yellow-100 text-yellow-800",
      assessed: "bg-purple-100 text-purple-800",
      approved: "bg-green-100 text-green-800",
      settled: "bg-gray-100 text-gray-800",
      rejected: "bg-red-100 text-red-800",
      closed: "bg-slate-100 text-slate-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const canCreateSettlement = (claim: Claim) => {
    return claim.status === 'approved' && claim.investigation_complete && claim.documents_complete;
  };

  const canCreateDischarge = (claim: Claim) => {
    return claim.status === 'settled' && claim.settlement_amount && claim.settlement_amount > 0;
  };

  const handleSettlementSuccess = () => {
    loadClaims();
    toast({
      title: "Success",
      description: "Settlement voucher processed successfully",
    });
  };

  const handleDischargeSuccess = () => {
    loadClaims();
    toast({
      title: "Success", 
      description: "Discharge voucher created successfully",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Claims Management</h2>
          <p className="text-gray-600">Manage and track insurance claims</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadClaims} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register New Claim
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Workflow Stage</label>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stageOptions.map(stage => (
                  <SelectItem key={stage} value={stage}>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Claims Table */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Claims ({filteredClaims.length})</h3>
        </div>
        
        {filteredClaims.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No claims found</h3>
            <p className="text-gray-600 text-center mb-4">
              {claims.length === 0 
                ? "No claims have been registered yet. Start by registering your first claim."
                : "No claims match your search criteria. Try adjusting your filters."
              }
            </p>
            {claims.length === 0 && (
              <Button>
                Register First Claim
              </Button>
            )}
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Policy</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Estimated Loss</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Reported Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.claim_number}</TableCell>
                  <TableCell>{claim.client_name}</TableCell>
                  <TableCell>{claim.policy_number}</TableCell>
                  <TableCell>{claim.claim_type}</TableCell>
                  <TableCell>₦{claim.estimated_loss?.toLocaleString() || '0'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(claim.status)}>
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(claim.status)}>
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(claim.reported_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedClaimForWorkflow(claim)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedClaimForEdit(claim)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {canCreateSettlement(claim) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setShowSettlementModal(true);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      {canCreateDischarge(claim) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setShowDischargeModal(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => setSelectedClaimForEdit(claim)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <SettlementVoucherModal
        open={showSettlementModal}
        onOpenChange={setShowSettlementModal}
        claim={selectedClaim}
        onSuccess={handleSettlementSuccess}
      />

      <DischargeVoucherModal
        open={showDischargeModal}
        onOpenChange={setShowDischargeModal}
        claim={selectedClaim}
        onSuccess={handleDischargeSuccess}
      />

      <Dialog open={!!selectedClaimForWorkflow} onOpenChange={(open) => !open && setSelectedClaimForWorkflow(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Claims Workflow Progress</DialogTitle>
          </DialogHeader>
          {selectedClaimForWorkflow && (
            <ClaimsWorkflowTracker
              currentStatus={selectedClaimForWorkflow.status}
              claimNumber={selectedClaimForWorkflow.claim_number}
              clientName={selectedClaimForWorkflow.client_name}
              estimatedLoss={Number(selectedClaimForWorkflow.estimated_loss)}
              createdAt={selectedClaimForWorkflow.created_at}
            />
          )}
        </DialogContent>
      </Dialog>

      <ClaimEditModal
        open={!!selectedClaimForEdit}
        onOpenChange={(open) => !open && setSelectedClaimForEdit(null)}
        claim={selectedClaimForEdit}
        onSuccess={loadClaims}
      />
    </div>
  );
};
