
import { useState } from "react";
import { QuoteManagementWorkflow } from "./QuoteManagementWorkflow";
import { QuoteDashboard } from "./QuoteDashboard";
import { QuoteAuditTrail } from "./QuoteAuditTrail";
import { WorkflowProvider } from "./QuoteWorkflowProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Activity, Settings } from "lucide-react";

type ViewMode = 'dashboard' | 'workflow' | 'audit';

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  policy_type: string;
  premium: number;
  status: string;
  workflow_stage: string;
  created_at: string;
  valid_until: string;
}

export const QuoteManagement = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const handleNewQuote = () => {
    setSelectedQuote(null);
    setViewMode('workflow');
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setViewMode('workflow');
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setViewMode('audit');
  };

  const handleBackToDashboard = () => {
    setSelectedQuote(null);
    setViewMode('dashboard');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'dashboard':
        return (
          <QuoteDashboard
            onNewQuote={handleNewQuote}
            onEditQuote={handleEditQuote}
            onViewQuote={handleViewQuote}
          />
        );
      
      case 'workflow':
        return (
          <WorkflowProvider>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleBackToDashboard}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                {selectedQuote && (
                  <div className="text-sm text-gray-600">
                    Editing: {selectedQuote.quote_number} - {selectedQuote.client_name}
                  </div>
                )}
              </div>
              <QuoteManagementWorkflow 
                editingQuote={selectedQuote}
                onWorkflowComplete={handleBackToDashboard}
              />
            </div>
          </WorkflowProvider>
        );
      
      case 'audit':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBackToDashboard}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              {selectedQuote && (
                <div className="text-sm text-gray-600">
                  Viewing: {selectedQuote.quote_number} - {selectedQuote.client_name}
                </div>
              )}
            </div>
            
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Quote Details
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Audit Trail
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Quote Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedQuote ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div><strong>Quote Number:</strong> {selectedQuote.quote_number}</div>
                        <div><strong>Client:</strong> {selectedQuote.client_name}</div>
                        <div><strong>Policy Type:</strong> {selectedQuote.policy_type}</div>
                        <div><strong>Premium:</strong> ₦{selectedQuote.premium?.toLocaleString()}</div>
                        <div><strong>Status:</strong> {selectedQuote.status}</div>
                        <div><strong>Stage:</strong> {selectedQuote.workflow_stage}</div>
                        <div><strong>Created:</strong> {new Date(selectedQuote.created_at).toLocaleDateString()}</div>
                        <div><strong>Valid Until:</strong> {new Date(selectedQuote.valid_until).toLocaleDateString()}</div>
                      </div>
                    ) : (
                      <p>No quote selected</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="audit">
                {selectedQuote && <QuoteAuditTrail quoteId={selectedQuote.id} />}
              </TabsContent>
            </Tabs>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      {renderContent()}
    </div>
  );
};
