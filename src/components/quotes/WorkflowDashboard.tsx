
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowStatusCard } from "./WorkflowStatusCard";
import { QuoteService } from "@/services/database/quoteService";
import { useToast } from "@/hooks/use-toast";
import { Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const WorkflowDashboard = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const { toast } = useToast();

  const workflowStages = [
    { value: "all", label: "All Stages" },
    { value: "draft", label: "Draft" },
    { value: "client-onboarding", label: "Client Onboarding" },
    { value: "quote-drafting", label: "Quote Drafting" },
    { value: "clause-recommendation", label: "Clause Recommendation" },
    { value: "rfq-generation", label: "RFQ Generation" },
    { value: "insurer-matching", label: "Insurer Matching" },
    { value: "quote-evaluation", label: "Quote Evaluation" },
    { value: "client-selection", label: "Client Selection" },
    { value: "payment-processing", label: "Payment Processing" },
    { value: "contract-generation", label: "Contract Generation" }
  ];

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const data = await QuoteService.getAll();
      setQuotes(data);
    } catch (error) {
      console.error('Error loading quotes:', error);
      toast({
        title: "Error",
        description: "Failed to load quotes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === "all" || quote.workflow_stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const getQuotesByStatus = (status: string) => {
    return filteredQuotes.filter(quote => quote.status === status);
  };

  const getQuotesByStage = (stage: string) => {
    return filteredQuotes.filter(quote => quote.workflow_stage === stage);
  };

  const handleViewDetails = (quoteId: string) => {
    // Navigate to quote details or open modal
    console.log('View quote details:', quoteId);
  };

  const handleStartNewWorkflow = () => {
    // Navigate to new workflow or open modal
    console.log('Start new workflow');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Workflow Dashboard</h1>
        <Button onClick={handleStartNewWorkflow}>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getQuotesByStatus('sent').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {getQuotesByStatus('pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getQuotesByStatus('accepted').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by client name or quote number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                {workflowStages.map(stage => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Workflows</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuotes.map(quote => (
              <WorkflowStatusCard
                key={quote.id}
                quoteId={quote.quote_number}
                currentStage={quote.workflow_stage || 'draft'}
                status={quote.status}
                clientName={quote.client_name}
                assignedTo={quote.created_by}
                lastUpdated={quote.updated_at}
                onViewDetails={() => handleViewDetails(quote.id)}
              />
            ))}
          </div>
          {filteredQuotes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No workflows found matching your filters.
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getQuotesByStatus('sent').map(quote => (
              <WorkflowStatusCard
                key={quote.id}
                quoteId={quote.quote_number}
                currentStage={quote.workflow_stage || 'draft'}
                status={quote.status}
                clientName={quote.client_name}
                assignedTo={quote.created_by}
                lastUpdated={quote.updated_at}
                onViewDetails={() => handleViewDetails(quote.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getQuotesByStatus('accepted').map(quote => (
              <WorkflowStatusCard
                key={quote.id}
                quoteId={quote.quote_number}
                currentStage={quote.workflow_stage || 'draft'}
                status={quote.status}
                clientName={quote.client_name}
                assignedTo={quote.created_by}
                lastUpdated={quote.updated_at}
                onViewDetails={() => handleViewDetails(quote.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="blocked">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getQuotesByStatus('rejected').map(quote => (
              <WorkflowStatusCard
                key={quote.id}
                quoteId={quote.quote_number}
                currentStage={quote.workflow_stage || 'draft'}
                status={quote.status}
                clientName={quote.client_name}
                assignedTo={quote.created_by}
                lastUpdated={quote.updated_at}
                onViewDetails={() => handleViewDetails(quote.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
