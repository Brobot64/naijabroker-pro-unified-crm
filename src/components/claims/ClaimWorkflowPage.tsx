import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Claim } from "@/services/database/types";
import { ClaimsWorkflowProgress } from "./ClaimsWorkflowProgress";
import { ClaimPortalLinkService } from "@/services/claimPortalLinkService";
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
  RefreshCw,
  Link,
  Copy,
  ExternalLink
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
  const [portalLink, setPortalLink] = useState<string>('');
  const [portalLinkGenerated, setPortalLinkGenerated] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

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

  const handleGeneratePortalLink = async () => {
    setIsGeneratingLink(true);
    try {
      // Generate a temporary UUID for client_id (in real app, get from policy/client relationship)
      const tempClientId = crypto.randomUUID();
      
      const { data, error } = await ClaimPortalLinkService.generateClaimPortalLink(
        claim.id,
        tempClientId,
        {
          claim_number: claim.claim_number,
          client_name: claim.client_name,
          claim_type: claim.claim_type,
          incident_date: claim.incident_date,
          description: claim.description
        }
      );

      if (error) {
        toast({
          title: "Error",
          description: "Failed to generate portal link",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setPortalLink(data.portalUrl);
        setPortalLinkGenerated(true);
        
        // Get client email from policy (need to fetch policy data)
        const { data: policyData } = await supabase
          .from('policies')
          .select('client_email')
          .eq('id', claim.policy_id)
          .single();
        
        const clientEmail = policyData?.client_email || 'no-email@example.com';
        
        // Send email notification
        await ClaimPortalLinkService.sendEmailNotification(
          'claim_portal_link',
          clientEmail,
          `Claim Portal Access - ${claim.claim_number}`,
          `Dear ${claim.client_name},\n\nPlease use the following link to access your claim portal and complete your claim registration:\n\n${data.portalUrl}\n\nThis link will expire in 72 hours.\n\nBest regards,\nYour Insurance Team`,
          { 
            claim_id: claim.id, 
            portal_link_id: data.portalLinkId,
            portalUrl: data.portalUrl,
            clientEmail: clientEmail
          }
        );
        
        toast({
          title: "Success",
          description: "Portal link generated and sent to client"
        });
      }
    } catch (error) {
      console.error('Error generating portal link:', error);
      toast({
        title: "Error",
        description: "Failed to generate portal link",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyPortalLink = () => {
    navigator.clipboard.writeText(portalLink);
    toast({
      title: "Copied",
      description: "Portal link copied to clipboard"
    });
  };

  const openPortalLink = () => {
    window.open(portalLink, '_blank');
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
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Manual Registration Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Manual Registration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="policy_number">Policy Number</Label>
                    <Select defaultValue={claim.policy_number}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={claim.policy_number}>{claim.policy_number} - Active Policy</SelectItem>
                        <SelectItem value="POL002">POL002 - Motor Insurance</SelectItem>
                        <SelectItem value="POL003">POL003 - Property Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input defaultValue={claim.client_name} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="incident_date">Date of Loss</Label>
                    <Input type="date" defaultValue={claim.incident_date} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      placeholder="Describe the incident..." 
                      defaultValue={claim.description}
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleStepComplete('registration')}
                  >
                    Register Claim
                  </Button>
                </CardContent>
              </Card>

              {/* Client Portal Access */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Client Portal Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Generate a secure portal link for the client to complete their claim registration online.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                      <label className="font-medium">Loss Date:</label>
                      <p className="text-muted-foreground">{new Date(claim.incident_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {!portalLinkGenerated ? (
                    <Button 
                      onClick={handleGeneratePortalLink}
                      disabled={isGeneratingLink}
                      className="w-full"
                    >
                      {isGeneratingLink ? 'Generating...' : 'Generate Portal Link'}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Portal Link Generated</p>
                        <p className="text-xs font-mono break-all">{portalLink}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyPortalLink}>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={openPortalLink}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>✓ Link sent to {claim.policy_number} client email</p>
                        <p>✓ Copy sent to broker</p>
                        <p>✓ Expires in 72 hours</p>
                      </div>
                      
                      <Button 
                        className="w-full mt-3" 
                        onClick={() => handleStepComplete('registration')}
                      >
                        Continue to Document Upload
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
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