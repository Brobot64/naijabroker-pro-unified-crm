
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { QuoteService } from '@/services/database/quoteService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  RefreshCw
} from "lucide-react";

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  policy_type: string;
  premium: number;
  status: string;
  workflow_stage: string;
  payment_status?: string;
  created_at: string;
  valid_until: string;
}

interface QuoteDashboardProps {
  onNewQuote: () => void;
  onEditQuote: (quote: Quote) => void;
  onViewQuote: (quote: Quote) => void;
}

export const QuoteDashboard = ({ onNewQuote, onEditQuote, onViewQuote }: QuoteDashboardProps) => {
  const { organizationId } = useAuth();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  useEffect(() => {
    loadQuotes();
  }, [organizationId]);

  // Manual refresh only - auto-refresh removed to prevent form interruptions

  const loadQuotes = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      console.log('🔄 Loading quotes and refreshing status...');
      
      // Force refresh all quote statuses first
      const { QuoteStatusSync } = await import('@/utils/quoteStatusSync');
      
      const quotesData = await QuoteService.getByOrganization(organizationId);
      
      // Refresh status for each quote to ensure latest data
      const quotesWithLatestStatus = await Promise.all(
        (quotesData || []).map(async (quote) => {
          try {
            const latestStatus = await QuoteStatusSync.getLatestQuoteStatus(quote.id);
            return { ...quote, ...latestStatus };
          } catch (error) {
            console.warn(`⚠️ Failed to refresh status for quote ${quote.id}:`, error);
            return quote;
          }
        })
      );
      
      setQuotes(quotesWithLatestStatus);
      console.log('✅ Quotes loaded and status refreshed');
    } catch (error) {
      console.error('❌ Error loading quotes:', error);
      toast({
        title: "Error",
        description: "Failed to load quotes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteContract = async (quoteId: string) => {
    try {
      const { WorkflowStatusService } = await import('@/services/workflowStatusService');
      
      console.log('Completing contract for quote:', quoteId);
      
      // Update workflow stage to completed
      await WorkflowStatusService.updateWorkflowStageOnly(quoteId, 'completed');
      
      // Ensure payment status is completed
      await WorkflowStatusService.updatePaymentStatus(quoteId, 'completed');
      
      // Try to update quote status to accepted
      try {
        await WorkflowStatusService.updateQuoteWorkflowStage(quoteId, {
          stage: 'completed',
          status: 'accepted'
        });
        console.log('Quote status updated to accepted successfully');
      } catch (statusError) {
        console.warn('Could not update quote status to accepted, but workflow completed:', statusError);
      }
      
      toast({
        title: "Success",
        description: "Contract completed successfully"
      });
      loadQuotes();
    } catch (error) {
      console.error('Error completing contract:', error);
      toast({
        title: "Error",
        description: "Failed to complete contract",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      await QuoteService.delete(quoteId);
      toast({
        title: "Success",
        description: "Quote deleted successfully"
      });
      loadQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast({
        title: "Error",
        description: "Failed to delete quote",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'client-onboarding': return 'bg-blue-500';
      case 'quote-drafting': return 'bg-purple-500';
      case 'rfq-generation': return 'bg-orange-500';
      case 'insurer-matching': return 'bg-cyan-500';
      case 'quote-evaluation': return 'bg-indigo-500';
      case 'client-selection': return 'bg-teal-500';
      case 'client_approved': return 'bg-green-600';
      case 'payment-processing': return 'bg-emerald-500';
      case 'contract-generation': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    const matchesStage = stageFilter === 'all' || quote.workflow_stage === stageFilter;
    
    return matchesSearch && matchesStatus && matchesStage;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-4"></div>
          <span>Loading quotes...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quote Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadQuotes}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={onNewQuote}>
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search quotes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Workflow Stage</label>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="client-onboarding">Client Onboarding</SelectItem>
                  <SelectItem value="quote-drafting">Quote Drafting</SelectItem>
                  <SelectItem value="rfq-generation">RFQ Generation</SelectItem>
                  <SelectItem value="insurer-matching">Insurer Matching</SelectItem>
                  <SelectItem value="quote-evaluation">Quote Evaluation</SelectItem>
                  <SelectItem value="client-selection">Client Selection</SelectItem>
                  <SelectItem value="client_approved">Client Approved</SelectItem>
                  <SelectItem value="payment-processing">Payment Processing</SelectItem>
                  <SelectItem value="contract-generation">Contract Generation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quotes ({filteredQuotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
              <p className="text-gray-600 mb-4">
                {quotes.length === 0 
                  ? "Get started by creating your first quote" 
                  : "Try adjusting your filters or search term"
                }
              </p>
              {quotes.length === 0 && (
                <Button onClick={onNewQuote}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Quote
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Quote #</th>
                    <th className="text-left py-3 px-4 font-medium">Client</th>
                    <th className="text-left py-3 px-4 font-medium">Policy Type</th>
                    <th className="text-left py-3 px-4 font-medium">Premium</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Stage</th>
                    <th className="text-left py-3 px-4 font-medium">Valid Until</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{quote.quote_number}</td>
                      <td className="py-3 px-4">{quote.client_name}</td>
                      <td className="py-3 px-4 capitalize">{quote.policy_type?.replace('-', ' ')}</td>
                      <td className="py-3 px-4">₦{quote.premium?.toLocaleString() || '0'}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(quote.status)} text-white`}>
                          {quote.status}
                        </Badge>
                      </td>
                       <td className="py-3 px-4">
                         <Badge variant="outline" className={`${getStageColor(quote.workflow_stage)} text-white border-0`}>
                           {quote.workflow_stage?.replace('-', ' ').replace('_', ' ')}
                         </Badge>
                         {quote.payment_status && quote.payment_status !== 'pending' && (
                           <Badge variant="outline" className="ml-1 text-xs">
                             Payment: {quote.payment_status}
                           </Badge>
                         )}
                       </td>
                      <td className="py-3 px-4">
                        {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewQuote(quote)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditQuote(quote)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {quote.workflow_stage === 'contract-generation' && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteContract(quote.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuote(quote.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
