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
import { UnderwriterAssignment } from "./UnderwriterAssignment";
import { useClaimWorkflow } from "@/hooks/useClaimWorkflow";
import { Switch } from "@/components/ui/switch";
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
  ExternalLink,
  Eye,
  Calendar,
  User,
  Phone,
  MapPin,
  Camera,
  AlertTriangle,
  Shield,
  Clock,
  Star,
  Save
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
  const [existingDocuments, setExistingDocuments] = useState<{ url: string; name: string; uploadedAt?: string }[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [portalLinkStatus, setPortalLinkStatus] = useState<'none' | 'generated' | 'used'>('none');
  const [existingPortalLink, setExistingPortalLink] = useState<string>('');
  
  // Form states for editable fields
  const [incidentDate, setIncidentDate] = useState(claim.incident_date);
  const [description, setDescription] = useState(claim.description || '');
  const [furtherDetails, setFurtherDetails] = useState('');
  
  // Policy details for claim summary
  const [policyDetails, setPolicyDetails] = useState<{ insurer: string; premium: number; sum_insured: number } | null>(null);

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
    // Load policy details for claim summary
    loadPolicyDetails();
  }, [claim.status, claim.id]);

  const loadPolicyDetails = async () => {
    try {
      const { data: policy, error } = await supabase
        .from('policies')
        .select('underwriter, premium, sum_insured')
        .eq('id', claim.policy_id)
        .single();

      if (error) {
        console.error('Error loading policy:', error);
        return;
      }

      if (policy) {
        setPolicyDetails({
          insurer: policy.underwriter || 'Not specified',
          premium: policy.premium || 0,
          sum_insured: policy.sum_insured || 0
        });
      }
    } catch (error) {
      console.error('Error loading policy details:', error);
    }
  };

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

  const loadExistingDocuments = async () => {
    try {
      const documents: { url: string; name: string; uploadedAt?: string }[] = [];
      
      // Check if documents were uploaded via portal by checking documents_complete status
      // and parsing documents from the claim notes
      if (claim.notes) {
        // Extract document URLs from claim notes - updated regex to catch storage URLs
        const urlRegex = /https:\/\/[^\s\n]+/gi;
        const allUrls = claim.notes.match(urlRegex) || [];
        
        // Filter for document URLs (storage URLs or file extensions)
        const documentUrls = allUrls.filter(url => 
          url.includes('claim-documents') || 
          /\.(pdf|jpg|jpeg|png|docx|doc)(\?|$)/i.test(url)
        );
        
        documentUrls.forEach((url, index) => {
          const filename = url.split('/').pop()?.split('?')[0] || `Document ${index + 1}`;
          documents.push({ url, name: filename });
        });
      }
      
      // Also check for documents uploaded through other means
      const { data: documentRecords, error } = await supabase
        .from('claim_audit_trail')
        .select('details, created_at')
        .eq('claim_id', claim.id)
        .eq('action', 'client_portal_submission')
        .order('created_at', { ascending: false });
        
      if (!error && documentRecords && documentRecords.length > 0) {
        documentRecords.forEach(record => {
          if (record.details && typeof record.details === 'object') {
            const details = record.details as { uploaded_files?: string[] };
            if (details.uploaded_files && Array.isArray(details.uploaded_files)) {
              details.uploaded_files.forEach((url, index) => {
                const filename = url.split('/').pop()?.split('?')[0] || `Portal Document ${index + 1}`;
                documents.push({ 
                  url, 
                  name: filename, 
                  uploadedAt: new Date(record.created_at).toLocaleDateString() 
                });
              });
            }
          }
        });
      }
      
      // Remove duplicates based on URL
      const uniqueDocuments = documents.filter((doc, index, self) => 
        index === self.findIndex(d => d.url === doc.url)
      );
      
      setExistingDocuments(uniqueDocuments);
    } catch (error) {
      console.error('Error loading existing documents:', error);
    }
  };

  const removeExistingDocument = async (docUrl: string) => {
    try {
      // Remove from existing documents state
      setExistingDocuments(prev => prev.filter(doc => doc.url !== docUrl));
      
      // Update claim notes to remove this document URL
      const updatedNotes = claim.notes?.replace(docUrl, '') || '';
      
      const { error } = await supabase
        .from('claims')
        .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
        .eq('id', claim.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document removed successfully"
      });
    } catch (error) {
      console.error('Error removing document:', error);
      toast({
        title: "Error",
        description: "Failed to remove document",
        variant: "destructive"
      });
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
        setPortalLinkStatus('generated'); // Update status to reflect generation
        
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

  const updateClaimDetails = async () => {
    try {
      const { error } = await supabase
        .from('claims')
        .update({
          incident_date: incidentDate,
          description: description,
          notes: (claim.notes || '') + (furtherDetails ? `\n\nFurther Details: ${furtherDetails}` : ''),
          updated_at: new Date().toISOString()
        })
        .eq('id', claim.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Claim details updated successfully"
      });

      // Continue to next stage
      handleStepComplete('registration');
    } catch (error) {
      console.error('Error updating claim:', error);
      toast({
        title: "Error",
        description: "Failed to update claim details",
        variant: "destructive"
      });
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
            {/* Removed first basic claim summary - keeping only the enhanced version */}

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
                    <Input value={claim.policy_number} disabled className="bg-muted" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input value={claim.client_name} disabled className="bg-muted" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="incident_date">Date of Loss</Label>
                    <Input 
                      type="date" 
                      value={incidentDate} 
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="border-blue-300 focus:border-blue-500" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border-blue-300 focus:border-blue-500"
                      rows={3}
                      placeholder="Update the claim description..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="further_details">Further Details</Label>
                    <Textarea 
                      value={furtherDetails}
                      onChange={(e) => setFurtherDetails(e.target.value)}
                      className="border-blue-300 focus:border-blue-500"
                      rows={4}
                      placeholder="Add additional details about the claim..."
                    />
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 font-medium mb-2">💡 AI Suggestion - Questions to ask the client:</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• What were the exact circumstances leading to the incident?</li>
                        <li>• Were there any witnesses present during the incident?</li>
                        <li>• Has a police report been filed? If so, what is the reference number?</li>
                        <li>• What immediate actions were taken following the incident?</li>
                        <li>• Are there any photos or videos of the damage/incident scene?</li>
                        <li>• Have any temporary repairs been made? If so, please provide receipts.</li>
                      </ul>
                    </div>
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
                      onClick={updateClaimDetails}
                    >
                      Update & Continue to Document Upload
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Client Portal Access */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      Client Portal Access
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={checkExistingPortalLink}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
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
                      
                      {portalLink && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Portal Link Used</p>
                          <p className="text-xs font-mono break-all">{portalLink}</p>
                        </div>
                      )}
                      
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
          <div className="space-y-6">
            {/* Claim Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Claim Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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
                    <p className="text-muted-foreground">₦{claim.estimated_loss?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="font-medium">Policy:</label>
                    <p className="text-muted-foreground">{claim.policy_number}</p>
                  </div>
                  <div>
                    <label className="font-medium">Status:</label>
                    <p className="text-muted-foreground">{claim.status}</p>
                  </div>
                  {policyDetails && (
                    <>
                      <div>
                        <label className="font-medium">Insurer:</label>
                        <p className="text-muted-foreground">{policyDetails.insurer}</p>
                      </div>
                      <div>
                        <label className="font-medium">Premium:</label>
                        <p className="text-muted-foreground">₦{policyDetails.premium.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="font-medium">Sum Insured:</label>
                        <p className="text-muted-foreground">₦{policyDetails.sum_insured.toLocaleString()}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Document Management
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadExistingDocuments}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              {/* Existing Documents */}
              {existingDocuments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Uploaded Documents</h4>
                  <div className="space-y-2">
                    {existingDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <div>
                            <span className="text-sm text-green-800 block">
                              {doc.name}
                            </span>
                            {doc.uploadedAt && (
                              <span className="text-xs text-green-600">
                                Uploaded: {doc.uploadedAt}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExistingDocument(doc.url)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {existingDocuments.length > 0 
                    ? `✓ ${existingDocuments.length} document(s) currently uploaded. You can upload additional documents below or remove existing ones as needed.`
                    : "No documents uploaded yet. You can upload documents on their behalf or generate a portal link for the client."
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
          </div>
        );

      case 'assignment':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Underwriter Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <UnderwriterAssignment claim={claim} onAssignmentComplete={() => handleStepComplete('assignment')} />
            </CardContent>
          </Card>
        );

      case 'review':
        return <ClaimReviewStage claim={claim} policyDetails={policyDetails} onStepComplete={() => handleStepComplete('review')} />;

      case 'validation':
        return <ClaimValidationStage claim={claim} policyDetails={policyDetails} onStepComplete={() => handleStepComplete('validation')} />;

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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
            {policyDetails && (
              <>
                <div>
                  <label className="font-medium">Insurer:</label>
                  <p className="text-muted-foreground">{policyDetails.insurer}</p>
                </div>
                <div>
                  <label className="font-medium">Premium:</label>
                  <p className="text-muted-foreground">₦{policyDetails.premium.toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium">Sum Insured:</label>
                  <p className="text-muted-foreground">₦{policyDetails.sum_insured.toLocaleString()}</p>
                </div>
              </>
            )}
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

// Claim Review Stage Component
interface ClaimReviewStageProps {
  claim: Claim;
  policyDetails: { insurer: string; premium: number; sum_insured: number } | null;
  onStepComplete: () => void;
}

const ClaimReviewStage = ({ claim, policyDetails, onStepComplete }: ClaimReviewStageProps) => {
  const { toast } = useToast();
  const { transitionClaim, loading } = useClaimWorkflow();
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [riskAssessment, setRiskAssessment] = useState('');
  const [recommendedAction, setRecommendedAction] = useState<'approve' | 'reject' | 'request_more_info'>('approve');
  const [fraudIndicators, setFraudIndicators] = useState<string[]>([]);
  const [witnessContacts, setWitnessContacts] = useState<{ name: string; phone: string; email: string }[]>([]);
  const [investigationChecklist, setInvestigationChecklist] = useState({
    documentsReviewed: false,
    clientInterviewed: false,
    sceneInspected: false,
    witnessesContacted: false,
    policeReportObtained: false,
    medicalRecordsReviewed: false,
    repairEstimatesObtained: false,
    previousClaimsChecked: false
  });

  const fraudRiskFactors = [
    'Multiple claims in short timeframe',
    'Inconsistent incident description',
    'Delayed reporting of incident',
    'No witnesses or uncooperative witnesses',
    'Unusual damage patterns',
    'High claim amount relative to premium',
    'Previous fraud history',
    'Missing or suspicious documentation'
  ];

  const handleFraudIndicatorToggle = (indicator: string) => {
    setFraudIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  const handleChecklistUpdate = (key: keyof typeof investigationChecklist) => {
    setInvestigationChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const addWitness = () => {
    setWitnessContacts(prev => [...prev, { name: '', phone: '', email: '' }]);
  };

  const updateWitness = (index: number, field: 'name' | 'phone' | 'email', value: string) => {
    setWitnessContacts(prev => prev.map((witness, i) => 
      i === index ? { ...witness, [field]: value } : witness
    ));
  };

  const removeWitness = (index: number) => {
    setWitnessContacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteReview = async () => {
    try {
      const reviewData = {
        investigation_notes: investigationNotes,
        risk_assessment: riskAssessment,
        recommended_action: recommendedAction,
        fraud_indicators: fraudIndicators,
        witness_contacts: witnessContacts,
        investigation_checklist: investigationChecklist,
        reviewed_at: new Date().toISOString()
      };

      // Update claim notes with review details
      const updatedNotes = `${claim.notes || ''}\n\n--- CLAIM REVIEW COMPLETED ---\nReviewed: ${new Date().toLocaleDateString()}\nRecommendation: ${recommendedAction}\nRisk Level: ${fraudIndicators.length > 2 ? 'HIGH' : fraudIndicators.length > 0 ? 'MEDIUM' : 'LOW'}\n\nInvestigation Notes:\n${investigationNotes}\n\nRisk Assessment:\n${riskAssessment}`;

      await supabase
        .from('claims')
        .update({ 
          notes: updatedNotes,
          investigation_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', claim.id);

      // Transition claim to assessed status
      await transitionClaim(claim.id, 'assessed', `Review completed. Recommendation: ${recommendedAction}`);

      toast({
        title: "Review Completed",
        description: "Claim review has been completed and moved to validation stage"
      });

      onStepComplete();
    } catch (error) {
      console.error('Error completing review:', error);
      toast({
        title: "Error",
        description: "Failed to complete claim review",
        variant: "destructive"
      });
    }
  };

  const completedChecklist = Object.values(investigationChecklist).filter(Boolean).length;
  const totalChecklist = Object.keys(investigationChecklist).length;
  const isReviewComplete = completedChecklist >= totalChecklist * 0.7; // 70% completion required

  return (
    <div className="space-y-6">
      {/* Claim Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Claim Review - Internal Investigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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
              <p className="text-muted-foreground">₦{claim.estimated_loss?.toLocaleString()}</p>
            </div>
            <div>
              <label className="font-medium">Policy:</label>
              <p className="text-muted-foreground">{claim.policy_number}</p>
            </div>
            <div>
              <label className="font-medium">Status:</label>
              <p className="text-muted-foreground">{claim.status}</p>
            </div>
            {policyDetails && (
              <>
                <div>
                  <label className="font-medium">Insurer:</label>
                  <p className="text-muted-foreground">{policyDetails.insurer}</p>
                </div>
                <div>
                  <label className="font-medium">Premium:</label>
                  <p className="text-muted-foreground">₦{policyDetails.premium.toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium">Sum Insured:</label>
                  <p className="text-muted-foreground">₦{policyDetails.sum_insured.toLocaleString()}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Investigation Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Investigation Checklist
              </div>
              <Badge variant="outline">
                {completedChecklist}/{totalChecklist} Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(investigationChecklist).map(([key, completed]) => (
              <div key={key} className="flex items-center space-x-3">
                <Switch
                  checked={completed}
                  onCheckedChange={() => handleChecklistUpdate(key as keyof typeof investigationChecklist)}
                />
                <label className="text-sm font-medium cursor-pointer">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
            ))}
            
            <div className={`p-3 rounded-lg ${isReviewComplete ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${isReviewComplete ? 'text-green-800' : 'text-yellow-800'}`}>
                {isReviewComplete 
                  ? '✓ Investigation checklist completed - Ready for review completion'
                  : `Complete ${Math.ceil(totalChecklist * 0.7) - completedChecklist} more items to proceed`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fraud Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Fraud Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {fraudRiskFactors.map(factor => (
                <div key={factor} className="flex items-center space-x-3">
                  <Switch
                    checked={fraudIndicators.includes(factor)}
                    onCheckedChange={() => handleFraudIndicatorToggle(factor)}
                  />
                  <label className="text-sm cursor-pointer">
                    {factor}
                  </label>
                </div>
              ))}
            </div>
            
            <div className={`p-3 rounded-lg ${
              fraudIndicators.length > 2 ? 'bg-red-50 border border-red-200' :
              fraudIndicators.length > 0 ? 'bg-yellow-50 border border-yellow-200' :
              'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center gap-2">
                <Shield className={`h-4 w-4 ${
                  fraudIndicators.length > 2 ? 'text-red-600' :
                  fraudIndicators.length > 0 ? 'text-yellow-600' :
                  'text-green-600'
                }`} />
                <span className={`font-medium text-sm ${
                  fraudIndicators.length > 2 ? 'text-red-800' :
                  fraudIndicators.length > 0 ? 'text-yellow-800' :
                  'text-green-800'
                }`}>
                  Risk Level: {fraudIndicators.length > 2 ? 'HIGH' : fraudIndicators.length > 0 ? 'MEDIUM' : 'LOW'}
                </span>
              </div>
              <p className={`text-xs mt-1 ${
                fraudIndicators.length > 2 ? 'text-red-700' :
                fraudIndicators.length > 0 ? 'text-yellow-700' :
                'text-green-700'
              }`}>
                {fraudIndicators.length} risk factors identified
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Witness Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Witness Information
            </div>
            <Button variant="outline" size="sm" onClick={addWitness}>
              Add Witness
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {witnessContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No witnesses added. Click "Add Witness" to record witness information.
            </p>
          ) : (
            witnessContacts.map((witness, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={witness.name}
                    onChange={(e) => updateWitness(index, 'name', e.target.value)}
                    placeholder="Witness name"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input
                    value={witness.phone}
                    onChange={(e) => updateWitness(index, 'phone', e.target.value)}
                    placeholder="Phone number"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input
                    value={witness.email}
                    onChange={(e) => updateWitness(index, 'email', e.target.value)}
                    placeholder="Email address"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeWitness(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Investigation Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Investigation Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Detailed Investigation Notes</Label>
            <Textarea
              value={investigationNotes}
              onChange={(e) => setInvestigationNotes(e.target.value)}
              placeholder="Document your investigation findings, interviews conducted, evidence reviewed, etc."
              rows={6}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label>Risk Assessment Summary</Label>
            <Textarea
              value={riskAssessment}
              onChange={(e) => setRiskAssessment(e.target.value)}
              placeholder="Summarize the overall risk assessment and key concerns..."
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Recommended Action</Label>
            <Select value={recommendedAction} onValueChange={(value: 'approve' | 'reject' | 'request_more_info') => setRecommendedAction(value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Approve for Assessment</SelectItem>
                <SelectItem value="request_more_info">Request More Information</SelectItem>
                <SelectItem value="reject">Recommend Rejection</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Save Draft
            </Button>
            <Button
              className="flex-1"
              onClick={handleCompleteReview}
              disabled={!isReviewComplete || !investigationNotes.trim() || loading}
            >
              {loading ? 'Processing...' : 'Complete Review & Move to Validation'}
            </Button>
          </div>
          
          {!isReviewComplete && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Complete the investigation checklist to proceed
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Claim Validation Stage Component
interface ClaimValidationStageProps {
  claim: Claim;
  policyDetails: { insurer: string; premium: number; sum_insured: number } | null;
  onStepComplete: () => void;
}

const ClaimValidationStage = ({ claim, policyDetails, onStepComplete }: ClaimValidationStageProps) => {
  const { toast } = useToast();
  const { transitionClaim, loading } = useClaimWorkflow();
  const [validationNotes, setValidationNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState(claim.estimated_loss || 0);
  const [validationDecision, setValidationDecision] = useState<'approved' | 'rejected' | 'pending'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [policyCompliance, setPolicyCompliance] = useState({
    withinCoverageLimit: false,
    withinPolicyPeriod: false,
    coverageTypeMatches: false,
    deductibleApplied: false,
    exclusionsChecked: false,
    policyConditionsMet: false
  });
  const [documentValidation, setDocumentValidation] = useState({
    claimFormComplete: false,
    proofOfLossProvided: false,
    repairEstimatesValid: false,
    medicalReportsValid: false,
    policeReportValid: false,
    photographicEvidence: false
  });

  const handlePolicyComplianceUpdate = (key: keyof typeof policyCompliance) => {
    setPolicyCompliance(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDocumentValidationUpdate = (key: keyof typeof documentValidation) => {
    setDocumentValidation(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCompleteValidation = async () => {
    try {
      const validationData = {
        validation_notes: validationNotes,
        approved_amount: approvedAmount,
        validation_decision: validationDecision,
        rejection_reason: rejectionReason,
        policy_compliance: policyCompliance,
        document_validation: documentValidation,
        validated_at: new Date().toISOString()
      };

      // Update claim with validation details
      const updatedNotes = `${claim.notes || ''}\n\n--- CLAIM VALIDATION COMPLETED ---\nValidated: ${new Date().toLocaleDateString()}\nDecision: ${validationDecision.toUpperCase()}\nApproved Amount: ₦${approvedAmount.toLocaleString()}\n\nValidation Notes:\n${validationNotes}${rejectionReason ? `\n\nRejection Reason:\n${rejectionReason}` : ''}`;

      await supabase
        .from('claims')
        .update({ 
          notes: updatedNotes,
          settlement_amount: validationDecision === 'approved' ? approvedAmount : 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', claim.id);

      // Transition claim based on decision
      const newStatus = validationDecision === 'approved' ? 'approved' : 'rejected';
      await transitionClaim(claim.id, newStatus, `Validation completed. Decision: ${validationDecision}`);

      toast({
        title: "Validation Completed",
        description: `Claim has been ${validationDecision} and moved to next stage`
      });

      onStepComplete();
    } catch (error) {
      console.error('Error completing validation:', error);
      toast({
        title: "Error",
        description: "Failed to complete claim validation",
        variant: "destructive"
      });
    }
  };

  const policyComplianceCompleted = Object.values(policyCompliance).filter(Boolean).length;
  const documentValidationCompleted = Object.values(documentValidation).filter(Boolean).length;
  const totalPolicyChecks = Object.keys(policyCompliance).length;
  const totalDocumentChecks = Object.keys(documentValidation).length;
  
  const isPolicyCompliant = policyComplianceCompleted >= totalPolicyChecks * 0.8;
  const isDocumentValidationComplete = documentValidationCompleted >= totalDocumentChecks * 0.7;
  const canComplete = isPolicyCompliant && isDocumentValidationComplete && validationDecision !== 'pending';

  return (
    <div className="space-y-6">
      {/* Claim Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Claim Validation - Final Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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
              <p className="text-muted-foreground">₦{claim.estimated_loss?.toLocaleString()}</p>
            </div>
            <div>
              <label className="font-medium">Policy:</label>
              <p className="text-muted-foreground">{claim.policy_number}</p>
            </div>
            <div>
              <label className="font-medium">Status:</label>
              <p className="text-muted-foreground">{claim.status}</p>
            </div>
            {policyDetails && (
              <>
                <div>
                  <label className="font-medium">Insurer:</label>
                  <p className="text-muted-foreground">{policyDetails.insurer}</p>
                </div>
                <div>
                  <label className="font-medium">Premium:</label>
                  <p className="text-muted-foreground">₦{policyDetails.premium.toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium">Sum Insured:</label>
                  <p className="text-muted-foreground">₦{policyDetails.sum_insured.toLocaleString()}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Policy Compliance Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Policy Compliance
              </div>
              <Badge variant={isPolicyCompliant ? "secondary" : "outline"}>
                {policyComplianceCompleted}/{totalPolicyChecks} Checked
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(policyCompliance).map(([key, checked]) => (
              <div key={key} className="flex items-center space-x-3">
                <Switch
                  checked={checked}
                  onCheckedChange={() => handlePolicyComplianceUpdate(key as keyof typeof policyCompliance)}
                />
                <label className="text-sm font-medium cursor-pointer">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
            ))}
            
            <div className={`p-3 rounded-lg ${isPolicyCompliant ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${isPolicyCompliant ? 'text-green-800' : 'text-yellow-800'}`}>
                {isPolicyCompliant 
                  ? '✓ Policy compliance requirements met'
                  : `Complete ${Math.ceil(totalPolicyChecks * 0.8) - policyComplianceCompleted} more checks`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Document Validation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Validation
              </div>
              <Badge variant={isDocumentValidationComplete ? "secondary" : "outline"}>
                {documentValidationCompleted}/{totalDocumentChecks} Validated
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(documentValidation).map(([key, validated]) => (
              <div key={key} className="flex items-center space-x-3">
                <Switch
                  checked={validated}
                  onCheckedChange={() => handleDocumentValidationUpdate(key as keyof typeof documentValidation)}
                />
                <label className="text-sm font-medium cursor-pointer">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
            ))}
            
            <div className={`p-3 rounded-lg ${isDocumentValidationComplete ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${isDocumentValidationComplete ? 'text-green-800' : 'text-yellow-800'}`}>
                {isDocumentValidationComplete 
                  ? '✓ Document validation completed'
                  : `Validate ${Math.ceil(totalDocumentChecks * 0.7) - documentValidationCompleted} more documents`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Decision */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Validation Decision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Validation Decision</Label>
              <Select value={validationDecision} onValueChange={(value: 'approved' | 'rejected' | 'pending') => setValidationDecision(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Decision</SelectItem>
                  <SelectItem value="approved">Approve Claim</SelectItem>
                  <SelectItem value="rejected">Reject Claim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {validationDecision === 'approved' && (
              <div>
                <Label>Approved Settlement Amount</Label>
                <Input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  className="mt-2"
                  placeholder="Enter approved amount"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Original estimate: ₦{claim.estimated_loss?.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {validationDecision === 'rejected' && (
            <div>
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide detailed reason for rejection..."
                rows={3}
                className="mt-2"
              />
            </div>
          )}

          <div>
            <Label>Validation Notes</Label>
            <Textarea
              value={validationNotes}
              onChange={(e) => setValidationNotes(e.target.value)}
              placeholder="Document your validation findings, any concerns, and final assessment..."
              rows={5}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
            <Button
              className="flex-1"
              onClick={handleCompleteValidation}
              disabled={!canComplete || loading}
              variant={validationDecision === 'approved' ? 'default' : validationDecision === 'rejected' ? 'destructive' : 'outline'}
            >
              {loading ? 'Processing...' : `Complete Validation - ${validationDecision.toUpperCase()}`}
            </Button>
          </div>
          
          {!canComplete && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground text-center">Complete all requirements to proceed:</p>
              <div className="text-xs text-center space-x-4">
                <span className={isPolicyCompliant ? 'text-green-600' : 'text-yellow-600'}>
                  Policy Compliance {isPolicyCompliant ? '✓' : '○'}
                </span>
                <span className={isDocumentValidationComplete ? 'text-green-600' : 'text-yellow-600'}>
                  Document Validation {isDocumentValidationComplete ? '✓' : '○'}
                </span>
                <span className={validationDecision !== 'pending' ? 'text-green-600' : 'text-yellow-600'}>
                  Decision Made {validationDecision !== 'pending' ? '✓' : '○'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};