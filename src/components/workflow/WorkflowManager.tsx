
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, User, FileText } from "lucide-react";
import { workflowService, Workflow } from "@/services/workflowService";
import { useToast } from "@/hooks/use-toast";

export const WorkflowManager = () => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [pendingWorkflows, setPendingWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [comments, setComments] = useState("");
  const [processingStep, setProcessingStep] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
    loadPendingWorkflows();
  }, []);

  const loadWorkflows = async () => {
    const { data } = await workflowService.getWorkflows();
    if (data) {
      setWorkflows(data);
    }
    setLoading(false);
  };

  const loadPendingWorkflows = async () => {
    const { data } = await workflowService.getPendingWorkflows();
    if (data) {
      setPendingWorkflows(data);
    }
  };

  const handleProcessStep = async (stepId: string, action: 'approve' | 'reject') => {
    setProcessingStep(stepId);
    const { error } = await workflowService.processWorkflowStep(stepId, action, comments);
    
    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} workflow step`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Workflow step ${action}d successfully`,
      });
      setShowApprovalDialog(false);
      setComments("");
      loadWorkflows();
      loadPendingWorkflows();
    }
    setProcessingStep(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  if (loading) {
    return <div>Loading workflows...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Workflow Management</h1>
      </div>

      {/* Pending Approvals Section */}
      {pendingWorkflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Pending Approvals ({pendingWorkflows.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingWorkflows.map((workflow) => (
                <div key={workflow.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{workflow.workflow_type}</h4>
                      <p className="text-sm text-gray-600">
                        {workflow.reference_type} - Step {workflow.current_step} of {workflow.total_steps}
                      </p>
                    </div>
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedWorkflow(workflow);
                        setShowApprovalDialog(true);
                      }}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Workflows Section */}
      <Card>
        <CardHeader>
          <CardTitle>All Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{workflow.workflow_type}</h4>
                    <p className="text-sm text-gray-600">
                      {workflow.reference_type} | Created: {new Date(workflow.created_at).toLocaleDateString()}
                    </p>
                    {workflow.amount && (
                      <p className="text-sm font-medium">Amount: ₦{workflow.amount.toLocaleString()}</p>
                    )}
                  </div>
                  <Badge className={getStatusColor(workflow.status)}>
                    {workflow.status}
                  </Badge>
                </div>

                {/* Workflow Steps Progress */}
                <div className="flex items-center space-x-2 mt-3">
                  {Array.from({ length: workflow.total_steps }, (_, index) => {
                    const stepNumber = index + 1;
                    const isCurrentStep = stepNumber === workflow.current_step;
                    const isCompleted = stepNumber < workflow.current_step;
                    
                    return (
                      <div key={stepNumber} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCompleted ? 'bg-green-100 text-green-800' :
                          isCurrentStep ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {stepNumber}
                        </div>
                        {stepNumber < workflow.total_steps && (
                          <div className={`w-8 h-1 ${
                            isCompleted ? 'bg-green-200' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Workflow</DialogTitle>
          </DialogHeader>
          {selectedWorkflow && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Workflow Type</Label>
                  <p className="font-medium">{selectedWorkflow.workflow_type}</p>
                </div>
                <div>
                  <Label>Reference</Label>
                  <p className="font-medium">{selectedWorkflow.reference_type}</p>
                </div>
                {selectedWorkflow.amount && (
                  <div>
                    <Label>Amount</Label>
                    <p className="font-medium">₦{selectedWorkflow.amount.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <Label>Current Step</Label>
                  <p className="font-medium">{selectedWorkflow.current_step} of {selectedWorkflow.total_steps}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add comments about your decision..."
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleProcessStep(selectedWorkflow.id, 'reject')}
                  disabled={!!processingStep}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleProcessStep(selectedWorkflow.id, 'approve')}
                  disabled={!!processingStep}
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
