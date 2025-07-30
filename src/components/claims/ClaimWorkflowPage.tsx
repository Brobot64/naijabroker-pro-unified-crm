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
  const [existingDocuments, setExistingDocuments] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [portalLinkStatus, setPortalLinkStatus] = useState<'none' | 'generated' | 'used'>('none');
  const [existingPortalLink, setExistingPortalLink] = useState<string>('');

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
    
    // Load existing documents from claim notes
    loadExistingDocuments();
    // Check existing portal links
    checkExistingPortalLink();
  }, [claim.status, claim.id]);

  const checkExistingPortalLink = async () => {
    try {
      const { data: existingLink, error } = await supabase
        .from('claim_portal_links')
        .select('token, is_used, expires_at')
        .eq('claim_id', claim.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking portal link:', error);
        return;
      }

      if (existingLink && existingLink.length > 0) {
        const link = existingLink[0];
        const portalUrl = ClaimPortalLinkService.generateClaimPortalUrl(link.token);
        setExistingPortalLink(portalUrl);
        
        if (link.is_used) {
          setPortalLinkStatus('used');
          setPortalLinkGenerated(true);
          setPortalLink(portalUrl);
        } else if (new Date(link.expires_at) > new Date()) {
          setPortalLinkStatus('generated');
          setPortalLinkGenerated(true);
          setPortalLink(portalUrl);
        } else {
          setPortalLinkStatus('none');
        }
      }
    } catch (error) {
      console.error('Error checking portal link:', error);
    }
  };

  const loadExistingDocuments = () => {
    if (claim.notes) {
      // Extract document URLs from claim notes
      const urlRegex = /https:\/\/[^\s]+\.(?:pdf|jpg|jpeg|png|docx|doc)/gi;
      const matches = claim.notes.match(urlRegex) || [];
      setExistingDocuments(matches);
    }
  };

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
        
        // Send email notification to client
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

        // Also send copy to broker (get organization email like in quote system)
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user?.id)
          .single();

        if (profile?.organization_id) {
          const { data: organization } = await supabase
            .from('organizations')
            .select('email, name')
            .eq('id', profile.organization_id)
            .single();

          const brokerEmail = organization?.email || 'broker@naijabrokerpro.com';
          
          await ClaimPortalLinkService.sendEmailNotification(
            'claim_portal_link_broker_copy',
            brokerEmail,
            `[BROKER COPY] Claim Portal Access - ${claim.claim_number}`,
            `Portal link has been sent to client: ${claim.client_name} (${clientEmail})\n\nClaim: ${claim.claim_number}\nPortal Link: ${data.portalUrl}\n\nThis is a copy for your records.`,
            { 
              claim_id: claim.id, 
              portal_link_id: data.portalLinkId,
              portalUrl: data.portalUrl,
              clientEmail: clientEmail,
              brokerEmail: brokerEmail
            }
          );
        }
        
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

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const newFiles = Array.from(files);
    
    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024;
    const invalidFiles = newFiles.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Error",
        description: `Files too large: ${invalidFiles.map(f => f.name).join(', ')}. Max size: 10MB`,
        variant: "destructive"
      });
      setUploading(false);
      return;
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploading(false);
    toast({
      title: "Success",
      description: `${newFiles.length} file(s) added`
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const submitAdditionalDocuments = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = uploadedFiles.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${claim.id}/additional_${Date.now()}_${index}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('claim-documents')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('claim-documents')
          .getPublicUrl(fileName);
          
        return publicUrl;
      });
      
      const fileUrls = await Promise.all(uploadPromises);
      
      // Update claim notes with new documents
      const additionalNotes = `\n\nAdditional Documents Uploaded (${new Date().toLocaleDateString()}):\n${fileUrls.join('\n')}`;
      
      const { error: updateError } = await supabase
        .from('claims')
        .update({
          notes: (claim.notes || '') + additionalNotes,
          documents_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', claim.id);

      if (updateError) throw updateError;

      // Refresh existing documents
      loadExistingDocuments();
      setUploadedFiles([]);
      
      toast({
        title: "Success",
        description: "Documents uploaded successfully"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      For the manual process, no fields are editable. You can only continue to next stage or cancel.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="policy_number">Policy Number</Label>
                    <Input value={claim.policy_number} disabled className="bg-muted" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input value={claim.client_name} disabled className="bg-muted" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="incident_date">Date of Loss</Label>
                    <Input type="date" value={claim.incident_date} disabled className="bg-muted" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      value={claim.description || ''}
                      disabled
                      className="bg-muted"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1" 
                      onClick={onBack}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={() => handleStepComplete('registration')}
                    >
                      Continue to Next Stage
                    </Button>
                  </div>
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
                  
                  {portalLinkStatus === 'none' ? (
                    <Button 
                      onClick={handleGeneratePortalLink}
                      disabled={isGeneratingLink}
                      className="w-full"
                    >
                      {isGeneratingLink ? 'Generating...' : 'Generate Portal Link'}
                    </Button>
                  ) : portalLinkStatus === 'used' ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-1">✓ Client Submission Completed</p>
                        <p className="text-xs text-green-700">Client has already submitted their claim details using the portal link.</p>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>✓ Portal link was used by client</p>
                        <p>✓ Documents may have been uploaded</p>
                        <p>✓ Status updated to 'investigating'</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          className="flex-1" 
                          onClick={handleGeneratePortalLink}
                          disabled={isGeneratingLink}
                        >
                          {isGeneratingLink ? 'Generating...' : 'Regenerate New Link'}
                        </Button>
                        <Button 
                          className="flex-1" 
                          onClick={() => handleStepComplete('registration')}
                        >
                          Continue to Next Stage
                        </Button>
                      </div>
                    </div>
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
                      
                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="outline"
                          className="flex-1" 
                          onClick={handleGeneratePortalLink}
                          disabled={isGeneratingLink}
                        >
                          {isGeneratingLink ? 'Generating...' : 'Regenerate Link'}
                        </Button>
                        <Button 
                          className="flex-1" 
                          onClick={() => handleStepComplete('registration')}
                        >
                          Continue to Document Upload
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'documents':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Document Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Documents */}
              {existingDocuments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Client Submitted Documents</h4>
                  <div className="space-y-2">
                    {existingDocuments.map((docUrl, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-800">
                            Document {index + 1} (from client portal)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(docUrl, '_blank')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {existingDocuments.length > 0 
                    ? `✓ Client has submitted ${existingDocuments.length} document(s) via portal. You can upload additional documents below if needed.`
                    : "Client has not yet submitted documents via portal. You can upload documents on their behalf or generate a portal link."
                  }
                </p>
              </div>

              {/* Additional Document Upload */}
              <div>
                <Label className="text-base font-medium">Upload Additional Documents</Label>
                <div className="space-y-4 mt-2">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('additional-file-upload')?.click()}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload additional files
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, PNG, JPG, DOCX up to 10MB each
                    </p>
                    <input
                      id="additional-file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.docx,.doc"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      disabled={uploading}
                    />
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Files to Upload:</p>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      
                      <Button 
                        onClick={submitAdditionalDocuments}
                        disabled={uploading}
                        className="w-full mt-3"
                      >
                        {uploading ? 'Uploading...' : 'Upload Documents'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => handleStepComplete('documents')}
                disabled={existingDocuments.length === 0 && uploadedFiles.length === 0}
              >
                Continue to Assignment
              </Button>
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