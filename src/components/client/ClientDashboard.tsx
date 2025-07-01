
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PolicyService } from "@/services/database/policyService";
import { QuoteService } from "@/services/database/quoteService";
import { ClaimService } from "@/services/database/claimService";
import { Policy, Quote, Claim } from "@/services/database/types";
import { FileText, Shield, AlertCircle } from "lucide-react";

interface ClientDashboardProps {
  clientEmail: string;
}

export const ClientDashboard = ({ clientEmail }: ClientDashboardProps) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data and filter by client email
        const [allPolicies, allQuotes, allClaims] = await Promise.all([
          PolicyService.getAll(),
          QuoteService.getAll(),
          ClaimService.getAll()
        ]);

        // Filter data for this specific client using correct property names
        setPolicies(allPolicies.filter(p => p.client_email === clientEmail));
        setQuotes(allQuotes.filter(q => q.client_email === clientEmail));
        setClaims(allClaims.filter(c => c.client_name.toLowerCase().includes(clientEmail.split('@')[0].toLowerCase())));
        
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (clientEmail) {
      fetchClientData();
    }
  }, [clientEmail]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'sent':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Insurance Portal</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your insurance coverage and requests.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policies.filter(p => p.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Total policies: {policies.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.filter(q => q.status === 'sent').length}</div>
            <p className="text-xs text-muted-foreground">Total quotes: {quotes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Claims</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.filter(c => !['settled', 'rejected', 'closed'].includes(c.status)).length}</div>
            <p className="text-xs text-muted-foreground">Total claims: {claims.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies">My Policies</TabsTrigger>
          <TabsTrigger value="quotes">My Quotes</TabsTrigger>
          <TabsTrigger value="claims">My Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          {policies.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No policies found</p>
              </CardContent>
            </Card>
          ) : (
            policies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{policy.policy_type}</CardTitle>
                    <Badge className={getStatusColor(policy.status)}>{policy.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Policy Number</p>
                      <p className="text-sm">{policy.policy_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Premium</p>
                      <p className="text-sm">₦{policy.premium.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Sum Insured</p>
                      <p className="text-sm">₦{policy.sum_insured.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Expires</p>
                      <p className="text-sm">{new Date(policy.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          {quotes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No quotes found</p>
              </CardContent>
            </Card>
          ) : (
            quotes.map((quote) => (
              <Card key={quote.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{quote.policy_type}</CardTitle>
                    <Badge className={getStatusColor(quote.status)}>{quote.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Quote Number</p>
                      <p className="text-sm">{quote.quote_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Premium</p>
                      <p className="text-sm">₦{quote.premium.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Sum Insured</p>
                      <p className="text-sm">₦{quote.sum_insured.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Valid Until</p>
                      <p className="text-sm">{new Date(quote.valid_until).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          {claims.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No claims found</p>
              </CardContent>
            </Card>
          ) : (
            claims.map((claim) => (
              <Card key={claim.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{claim.claim_type}</CardTitle>
                    <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Claim Number</p>
                      <p className="text-sm">{claim.claim_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Policy Number</p>
                      <p className="text-sm">{claim.policy_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Incident Date</p>
                      <p className="text-sm">{new Date(claim.incident_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Estimated Loss</p>
                      <p className="text-sm">₦{claim.estimated_loss.toLocaleString()}</p>
                    </div>
                  </div>
                  {claim.description && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-sm mt-1">{claim.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
