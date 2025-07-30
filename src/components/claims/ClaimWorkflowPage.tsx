import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Claim } from "@/services/database/types";
import { ClaimsWorkflowProgress } from "./ClaimsWorkflowProgress";
import { 
  AlertCircle, 
  FileText, 
  Upload, 
  UserCheck, 
  Search, 
  CheckCircle, 
  DollarSign, 
  MessageSquare, 
  Archive,
  ArrowLeft,
  RefreshCw
} from "lucide-react";

type ClaimWorkflowStep = 
  | 'notification'
  | 'registration'
  | 'documents'
  | 'assignment'
  | 'review'
  | 'validation'
  | 'settlement'
  | 'feedback'
  | 'closure';

interface ClaimWorkflowPageProps {
  claim: Claim;
  onBack: () => void;
  onSuccess?: () => void;
}

export const ClaimWorkflowPage = ({ claim, onBack, onSuccess }: ClaimWorkflowPageProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<ClaimWorkflowStep>('notification');

  const steps = [
    { id: 'notification', name: 'Claim Notification', icon: AlertCircle, description: 'Initial claim notification and client contact' },
    { id: 'registration', name: 'Claim Registration', icon: FileText, description: 'Complete claim registration and documentation' },
    { id: 'documents', name: 'Document Upload', icon: Upload, description: 'Upload and validate required documents' },
    { id: 'assignment', name: 'Underwriter Assignment', icon: UserCheck, description: 'Assign claim to underwriter or adjuster' },
    { id: 'review', name: 'Claim Review', icon: Search, description: 'Internal review and investigation' },
    { id: 'validation', name: 'Claim Validation', icon: CheckCircle, description: 'Validate claim legitimacy and completeness' },
    { id: 'settlement', name: 'Settlement Recommendation', icon: DollarSign, description: 'Recommend settlement amount and approach' },
    { id: 'feedback', name: 'Client Feedback', icon: MessageSquare, description: 'Collect client feedback and confirmation' },
    { id: 'closure', name: 'Claim Closure', icon: Archive, description: 'Close claim and finalize documentation' }
  ] as const;

  // Map claim status to workflow step
  const statusToStepMap: Record<string, ClaimWorkflowStep> = {
    'registered': 'registration',
    'investigating': 'review',
    'assessed': 'validation',
    'approved': 'settlement',
    'settled': 'feedback',
    'closed': 'closure'
  };

  useEffect(() => {
    // Set current step based on claim status
    const step = statusToStepMap[claim.status] || 'notification';
    setCurrentStep(step);
  }, [claim.status]);

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);

  const canNavigateToStep = (stepId: ClaimWorkflowStep) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = getCurrentStepIndex();
    
    // Can navigate to current step or previous steps
    return stepIndex <= currentIndex;
  };

  const navigateToStep = (stepId: ClaimWorkflowStep) => {
    if (canNavigateToStep(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const handleStepComplete = (stepId: ClaimWorkflowStep) => {
    // Auto-advance to next step
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1].id as ClaimWorkflowStep;
      setCurrentStep(nextStep);
    }
    
    toast({
      title: "Step Completed",
      description: `${steps.find(s => s.id === stepId)?.name} completed successfully`,
    });
  };

  const getStepStatus = (stepId: ClaimWorkflowStep): 'completed' | 'active' | 'pending' => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = getCurrentStepIndex();
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'notification':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Claim Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Client Notification Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Initial notification sent to client and broker. Claim has been registered in the system.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Notification Method</label>
                    <p className="text-sm text-muted-foreground">Email + Portal</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date Notified</label>
                    <p className="text-sm text-muted-foreground">{new Date(claim.reported_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <Button onClick={() => handleStepComplete('notification')}>
                  Continue to Registration
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'registration':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Claim Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Claim Number</label>
                    <p className="text-sm text-muted-foreground">{claim.claim_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Policy Number</label>
                    <p className="text-sm text-muted-foreground">{claim.policy_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Client Name</label>
                    <p className="text-sm text-muted-foreground">{claim.client_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Claim Type</label>
                    <p className="text-sm text-muted-foreground">{claim.claim_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date of Loss</label>
                    <p className="text-sm text-muted-foreground">{new Date(claim.incident_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estimated Loss</label>
                    <p className="text-sm text-muted-foreground">₦{claim.estimated_loss?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground">{claim.description}</p>
                </div>

                <Button onClick={() => handleStepComplete('registration')}>
                  Proceed to Document Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        const stepData = steps.find(s => s.id === currentStep);
        const StepIcon = stepData?.icon;
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {StepIcon && <StepIcon className="h-5 w-5" />}
                {stepData?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {stepData?.description}
                </p>
                <p className="text-sm">This step is in development.</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Editing: {claim.claim_number} - {claim.client_name}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            Step {getCurrentStepIndex() + 1} of {steps.length}
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id as ClaimWorkflowStep);
              const isActive = step.id === currentStep;
              const isCompleted = status === 'completed';
              const canNavigate = canNavigateToStep(step.id as ClaimWorkflowStep);
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <Button
                      variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
                      size="sm"
                      className={`w-12 h-12 rounded-full p-0 ${!canNavigate ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => canNavigate && navigateToStep(step.id as ClaimWorkflowStep)}
                      disabled={!canNavigate}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </Button>
                    <span className={`text-xs mt-2 text-center max-w-20 ${isActive ? 'font-semibold' : ''}`}>
                      {step.name}
                    </span>
                    {isCompleted && (
                      <Badge variant="secondary" className="mt-1 text-xs bg-green-100 text-green-700 border-green-300">
                        ✓
                      </Badge>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="h-0.5 w-8 bg-border mx-2 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Claim Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Claim Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="font-medium">Claim #:</label>
              <p className="text-muted-foreground">{claim.claim_number}</p>
            </div>
            <div>
              <label className="font-medium">Client:</label>
              <p className="text-muted-foreground">{claim.client_name}</p>
            </div>
            <div>
              <label className="font-medium">Type:</label>
              <p className="text-muted-foreground">{claim.claim_type}</p>
            </div>
            <div>
              <label className="font-medium">Estimated Loss:</label>
              <p className="text-muted-foreground">₦{claim.estimated_loss?.toLocaleString() || '0'}</p>
            </div>
            <div>
              <label className="font-medium">Policy:</label>
              <p className="text-muted-foreground">{claim.policy_number}</p>
            </div>
            <div>
              <label className="font-medium">Status:</label>
              <p className="text-muted-foreground">{claim.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>
    </div>
  );
};