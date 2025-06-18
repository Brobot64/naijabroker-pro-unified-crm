
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ClaimService } from "@/services/database/claimService";
import { SettlementVoucherModal } from "./SettlementVoucherModal";
import { DischargeVoucherModal } from "./DischargeVoucherModal";
import { Claim } from "@/services/database/types";
import { Plus, Search, FileText, CheckCircle, AlertCircle } from "lucide-react";

export const ClaimsManagement = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
  }, []);

  const filteredClaims = claims.filter(
    claim =>
      claim.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.policy_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Claims Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Register New Claim
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search claims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClaims.map((claim) => (
          <Card key={claim.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{claim.claim_number}</CardTitle>
                <Badge className={getStatusColor(claim.status)}>
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{claim.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Policy:</span>
                  <span>{claim.policy_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span>{claim.claim_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Loss:</span>
                  <span className="font-medium">₦{claim.estimated_loss.toLocaleString()}</span>
                </div>
                {claim.settlement_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Settlement:</span>
                    <span className="font-medium text-green-600">₦{claim.settlement_amount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  {claim.investigation_complete ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                  )}
                  <span>Investigation</span>
                </div>
                <div className="flex items-center gap-1">
                  {claim.documents_complete ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                  )}
                  <span>Documents</span>
                </div>
                <div className="flex items-center gap-1">
                  {claim.underwriter_approval ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                  )}
                  <span>Approval</span>
                </div>
              </div>

              <div className="flex gap-2">
                {canCreateSettlement(claim) && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedClaim(claim);
                      setShowSettlementModal(true);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Settlement
                  </Button>
                )}
                
                {canCreateDischarge(claim) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedClaim(claim);
                      setShowDischargeModal(true);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Discharge
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClaims.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No claims found</div>
          <p className="text-gray-400 mt-2">
            {searchTerm ? "Try adjusting your search criteria" : "Get started by registering a new claim"}
          </p>
        </div>
      )}

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
    </div>
  );
};
