
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { PolicyService } from "@/services/database/policyService";
import { Policy as DatabasePolicy } from "@/services/database/types";
import { PolicyUpdateModal } from "./PolicyUpdateModal";
import { PolicyDetailsModal } from "./PolicyDetailsModal";
import { PolicyIssuanceModal } from "./PolicyIssuanceModal";
import { QuoteSelectionModal } from "./QuoteSelectionModal";
import { RenewalReminders } from "./RenewalReminders";
import { AlertCircle, Plus, Eye, Edit, Filter, Download, Ban, CheckCircle } from "lucide-react";

type Policy = DatabasePolicy;

export const PolicyManagement = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showIssuanceModal, setShowIssuanceModal] = useState(false);
  const [showQuoteSelection, setShowQuoteSelection] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    activePolicies: 0,
    expiringThisMonth: 0,
    totalSumInsured: 0,
    totalPremium: 0,
    cancelledPolicies: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const fetchedPolicies = await PolicyService.getAll();
      setPolicies(fetchedPolicies);
      calculateStats(fetchedPolicies);
    } catch (error) {
      console.error('Failed to load policies:', error);
      toast({
        title: "Error",
        description: "Failed to load policies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (policiesList: Policy[]) => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const activePolicies = policiesList.filter(p => p.status === 'active').length;
    const cancelledPolicies = policiesList.filter(p => p.status === 'cancelled').length;
    const expiringThisMonth = policiesList.filter(p => {
      const expiryDate = new Date(p.end_date);
      return p.status === 'active' && expiryDate <= nextMonth && expiryDate >= today;
    }).length;
    
    const totalSumInsured = policiesList
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + p.sum_insured, 0);
    
    const totalPremium = policiesList
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + p.premium, 0);

    setStats({
      activePolicies,
      expiringThisMonth,
      totalSumInsured,
      totalPremium,
      cancelledPolicies
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-orange-100 text-orange-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isExpiringSoon = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    return expiry < today;
  };

  const handlePolicyView = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowDetailsModal(true);
  };

  const handlePolicyUpdate = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowUpdateModal(true);
  };

  const handleIssueNewPolicy = () => {
    setShowQuoteSelection(true);
  };

  const handleQuoteSelected = (quote: any) => {
    setSelectedQuote(quote);
    setShowIssuanceModal(true);
  };

  const handlePolicySuccess = () => {
    setSelectedQuote(null);
    setShowIssuanceModal(false);
    setShowQuoteSelection(false);
    setRefreshKey(prev => prev + 1); // Force refresh of quote selection
    loadPolicies();
  };

  const handleDeactivatePolicy = async (policy: Policy) => {
    if (!confirm(`Are you sure you want to deactivate policy ${policy.policy_number}?`)) return;
    
    try {
      await PolicyService.deactivatePolicy(policy.id);
      toast({
        title: "Success",
        description: "Policy has been deactivated successfully"
      });
      loadPolicies();
    } catch (error) {
      console.error('Error deactivating policy:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate policy",
        variant: "destructive"
      });
    }
  };

  const handleReactivatePolicy = async (policy: Policy) => {
    if (!confirm(`Are you sure you want to reactivate policy ${policy.policy_number}?`)) return;
    
    try {
      await PolicyService.reactivatePolicy(policy.id);
      toast({
        title: "Success",
        description: "Policy has been reactivated successfully"
      });
      loadPolicies();
    } catch (error) {
      console.error('Error reactivating policy:', error);
      toast({
        title: "Error",
        description: "Failed to reactivate policy",
        variant: "destructive"
      });
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policy_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || policy.status === statusFilter;
    const matchesType = typeFilter === "all" || policy.policy_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const uniqueTypes = Array.from(new Set(policies.map(p => p.policy_type)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Policy Management</h1>
        <Button onClick={handleIssueNewPolicy} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Issue New Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.activePolicies.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.expiringThisMonth}</div>
            <p className="text-xs text-muted-foreground">Expiring This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.cancelledPolicies}</div>
            <p className="text-xs text-muted-foreground">Cancelled Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦{(stats.totalSumInsured / 1000000).toFixed(0)}M</div>
            <p className="text-xs text-muted-foreground">Total Sum Insured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦{(stats.totalPremium / 1000000).toFixed(0)}M</div>
            <p className="text-xs text-muted-foreground">Annual Premium</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Policy Portfolio</TabsTrigger>
          <TabsTrigger value="renewals">Renewal Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Policy Portfolio</CardTitle>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search policies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading policies...</p>
                </div>
              ) : filteredPolicies.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No policies found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Number</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Sum Insured</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">{policy.policy_number}</TableCell>
                        <TableCell>{policy.client_name}</TableCell>
                        <TableCell>{policy.policy_type}</TableCell>
                        <TableCell className="font-semibold">₦{policy.sum_insured.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold text-green-600">₦{policy.premium.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(policy.status)}>{policy.status}</Badge>
                            {isExpired(policy.end_date) && policy.status === 'active' && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Expired
                              </Badge>
                            )}
                            {isExpiringSoon(policy.end_date) && policy.status === 'active' && !isExpired(policy.end_date) && (
                              <Badge variant="outline" className="border-yellow-300 text-yellow-700 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{policy.end_date}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePolicyView(policy)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            {policy.status === 'active' && (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={() => handlePolicyUpdate(policy)}
                                  className="flex items-center gap-1"
                                >
                                  <Edit className="h-3 w-3" />
                                  Update/Renew
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeactivatePolicy(policy)}
                                  className="flex items-center gap-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                                >
                                  <Ban className="h-3 w-3" />
                                  Deactivate
                                </Button>
                              </>
                            )}
                            {policy.status === 'cancelled' && (
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleReactivatePolicy(policy)}
                                className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Reactivate
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals">
          <RenewalReminders />
        </TabsContent>
      </Tabs>

      <PolicyUpdateModal
        open={showUpdateModal}
        onOpenChange={setShowUpdateModal}
        policy={selectedPolicy}
        onSuccess={loadPolicies}
      />

      <PolicyDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        policy={selectedPolicy}
        onUpdate={() => {
          setShowDetailsModal(false);
          handlePolicyUpdate(selectedPolicy);
        }}
      />

        <QuoteSelectionModal
          key={refreshKey}
          open={showQuoteSelection}
          onOpenChange={setShowQuoteSelection}
          onQuoteSelected={handleQuoteSelected}
          onPolicyCreated={handlePolicySuccess}
        />

      <PolicyIssuanceModal
        open={showIssuanceModal}
        onOpenChange={setShowIssuanceModal}
        quote={selectedQuote}
        onSuccess={handlePolicySuccess}
      />
    </div>
  );
};
