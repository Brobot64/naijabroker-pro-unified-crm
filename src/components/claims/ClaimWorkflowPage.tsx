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
  Save,
  Calculator,
  CreditCard,
  Users,
  TrendingUp,
  Edit,
  Download
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

      case 'settlement':
        return <SettlementRecommendationStage claim={claim} policyDetails={policyDetails} onStepComplete={() => handleStepComplete('settlement')} />;

      case 'feedback':
        return <ClientFeedbackStage claim={claim} policyDetails={policyDetails} onStepComplete={() => handleStepComplete('feedback')} />;

      case 'closure':
        return <ClaimClosureStage claim={claim} policyDetails={policyDetails} onStepComplete={() => handleStepComplete('closure')} />;

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

// Settlement Recommendation Stage Component
interface SettlementRecommendationStageProps {
  claim: Claim;
  policyDetails: { insurer: string; premium: number; sum_insured: number } | null;
  onStepComplete: () => void;
}

const SettlementRecommendationStage = ({ claim, policyDetails, onStepComplete }: SettlementRecommendationStageProps) => {
  const { toast } = useToast();
  const { transitionClaim, loading } = useClaimWorkflow();
  const [settlementAmount, setSettlementAmount] = useState(claim.settlement_amount || claim.estimated_loss || 0);
  const [settlementType, setSettlementType] = useState<'full' | 'partial' | 'final'>('full');
  const [recommendationNotes, setRecommendationNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cheque' | 'bank_transfer' | 'cash'>('cheque');
  const [chequeDetails, setChequeDetails] = useState({
    chequeNumber: '',
    bankName: '',
    chequeDate: new Date().toISOString().split('T')[0]
  });
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [settlement, setSettlement] = useState({
    deductibleApplied: false,
    depreciation: 0,
    salvageValue: 0,
    additionalCosts: 0
  });

  useEffect(() => {
    // Check if approval is required based on settlement amount
    if (policyDetails && settlementAmount > policyDetails.sum_insured * 0.8) {
      setApprovalRequired(true);
    } else {
      setApprovalRequired(false);
    }
  }, [settlementAmount, policyDetails]);

  const calculateNetSettlement = () => {
    let netAmount = settlementAmount;
    if (settlement.deductibleApplied && policyDetails) {
      netAmount -= policyDetails.sum_insured * 0.1; // Assume 10% deductible
    }
    netAmount -= settlement.depreciation;
    netAmount -= settlement.salvageValue;
    netAmount += settlement.additionalCosts;
    return Math.max(0, netAmount);
  };

  const handleCreateSettlementVoucher = async () => {
    try {
      const voucherData = {
        organization_id: claim.organization_id,
        claim_id: claim.id,
        voucher_number: `SV-${claim.claim_number}-${Date.now()}`,
        policy_number: claim.policy_number,
        client_name: claim.client_name,
        agreed_amount: calculateNetSettlement(),
        settlement_type: settlementType,
        cheque_number: chequeDetails.chequeNumber,
        cheque_date: chequeDetails.chequeDate,
        bank_name: chequeDetails.bankName,
        remarks: recommendationNotes,
        discharging_officer: 'System Generated'
      };

      const { data: voucher, error: voucherError } = await supabase
        .from('settlement_vouchers')
        .insert(voucherData)
        .select()
        .single();

      if (voucherError) throw voucherError;

      // Update claim with settlement details
      const updatedNotes = `${claim.notes || ''}\n\n--- SETTLEMENT RECOMMENDATION ---\nDate: ${new Date().toLocaleDateString()}\nRecommended Amount: ₦${settlementAmount.toLocaleString()}\nNet Settlement: ₦${calculateNetSettlement().toLocaleString()}\nSettlement Type: ${settlementType.toUpperCase()}\nPayment Method: ${paymentMethod.toUpperCase()}\n\nRecommendation Notes:\n${recommendationNotes}\n\nVoucher Number: ${voucherData.voucher_number}`;

      await supabase
        .from('claims')
        .update({ 
          notes: updatedNotes,
          settlement_amount: calculateNetSettlement(),
          updated_at: new Date().toISOString()
        })
        .eq('id', claim.id);

      // Transition claim to settled status
      await transitionClaim(claim.id, 'settled', `Settlement voucher created: ${voucherData.voucher_number}`);

      toast({
        title: "Settlement Voucher Created",
        description: `Voucher ${voucherData.voucher_number} has been generated and claim moved to settlement stage`
      });

      onStepComplete();
    } catch (error) {
      console.error('Error creating settlement voucher:', error);
      toast({
        title: "Error",
        description: "Failed to create settlement voucher",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Claim Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Settlement Recommendation
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
        {/* Settlement Calculation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Settlement Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Settlement Amount</Label>
              <Input
                type="number"
                value={settlementAmount}
                onChange={(e) => setSettlementAmount(Number(e.target.value))}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Original estimate: ₦{claim.estimated_loss?.toLocaleString()}
              </p>
            </div>

            <div>
              <Label>Settlement Type</Label>
              <Select value={settlementType} onValueChange={(value: 'full' | 'partial' | 'final') => setSettlementType(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Settlement</SelectItem>
                  <SelectItem value="partial">Partial Settlement</SelectItem>
                  <SelectItem value="final">Final Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Deductions & Adjustments</h4>
              
              <div className="flex items-center space-x-3">
                <Switch
                  checked={settlement.deductibleApplied}
                  onCheckedChange={(checked) => setSettlement(prev => ({ ...prev, deductibleApplied: checked }))}
                />
                <label className="text-sm">Apply Policy Deductible</label>
              </div>

              <div>
                <Label className="text-sm">Depreciation Amount</Label>
                <Input
                  type="number"
                  value={settlement.depreciation}
                  onChange={(e) => setSettlement(prev => ({ ...prev, depreciation: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Salvage Value</Label>
                <Input
                  type="number"
                  value={settlement.salvageValue}
                  onChange={(e) => setSettlement(prev => ({ ...prev, salvageValue: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Additional Costs</Label>
                <Input
                  type="number"
                  value={settlement.additionalCosts}
                  onChange={(e) => setSettlement(prev => ({ ...prev, additionalCosts: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Net Settlement Amount:</span>
                <span className="text-lg font-bold text-blue-700">₦{calculateNetSettlement().toLocaleString()}</span>
              </div>
            </div>

            {approvalRequired && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800 font-medium">⚠️ Management Approval Required</p>
                <p className="text-xs text-orange-700">Settlement amount exceeds 80% of sum insured</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value: 'cheque' | 'bank_transfer' | 'cash') => setPaymentMethod(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheque">Cheque Payment</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === 'cheque' && (
              <div className="space-y-3">
                <div>
                  <Label>Cheque Number</Label>
                  <Input
                    value={chequeDetails.chequeNumber}
                    onChange={(e) => setChequeDetails(prev => ({ ...prev, chequeNumber: e.target.value }))}
                    placeholder="Enter cheque number"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={chequeDetails.bankName}
                    onChange={(e) => setChequeDetails(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="Enter bank name"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Cheque Date</Label>
                  <Input
                    type="date"
                    value={chequeDetails.chequeDate}
                    onChange={(e) => setChequeDetails(prev => ({ ...prev, chequeDate: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Recommendation Notes</Label>
              <Textarea
                value={recommendationNotes}
                onChange={(e) => setRecommendationNotes(e.target.value)}
                placeholder="Document your settlement recommendation, basis for amount, and any special considerations..."
                rows={6}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

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
              Save Draft
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateSettlementVoucher}
              disabled={loading || !recommendationNotes.trim() || (paymentMethod === 'cheque' && (!chequeDetails.chequeNumber || !chequeDetails.bankName))}
            >
              {loading ? 'Processing...' : 'Create Settlement Voucher'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Client Feedback Stage Component
interface ClientFeedbackStageProps {
  claim: Claim;
  policyDetails: { insurer: string; premium: number; sum_insured: number } | null;
  onStepComplete: () => void;
}

const ClientFeedbackStage = ({ claim, policyDetails, onStepComplete }: ClientFeedbackStageProps) => {
  const { toast } = useToast();
  const { transitionClaim, loading } = useClaimWorkflow();
  const [feedbackCollected, setFeedbackCollected] = useState(false);
  const [clientSatisfaction, setClientSatisfaction] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [improvementSuggestions, setImprovementSuggestions] = useState('');
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [clientConfirmation, setClientConfirmation] = useState({
    settlementReceived: false,
    documentsComplete: false,
    satisfiedWithService: false,
    noFurtherClaims: false
  });

  const serviceOptions = [
    'Risk Assessment Review',
    'Policy Renewal Discussion',
    'Additional Coverage Options',
    'Premium Discount Eligibility',
    'Claims Prevention Consultation',
    'Other Insurance Products'
  ];

  const handleServiceToggle = (service: string) => {
    setAdditionalServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleConfirmationUpdate = (key: keyof typeof clientConfirmation) => {
    setClientConfirmation(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCloseClaim = async () => {
    try {
      const feedbackData = {
        client_satisfaction: clientSatisfaction,
        feedback_comments: feedbackComments,
        improvement_suggestions: improvementSuggestions,
        additional_services: additionalServices,
        follow_up_required: followUpRequired,
        client_confirmation: clientConfirmation,
        feedback_collected_at: new Date().toISOString()
      };

      // Update claim with feedback details
      const updatedNotes = `${claim.notes || ''}\n\n--- CLIENT FEEDBACK COLLECTED ---\nDate: ${new Date().toLocaleDateString()}\nSatisfaction Rating: ${clientSatisfaction}/5 stars\nServices Satisfied: ${Object.values(clientConfirmation).filter(Boolean).length}/4\n\nClient Comments:\n${feedbackComments}${improvementSuggestions ? `\n\nImprovement Suggestions:\n${improvementSuggestions}` : ''}${additionalServices.length > 0 ? `\n\nInterested Services:\n${additionalServices.join(', ')}` : ''}`;

      await supabase
        .from('claims')
        .update({ 
          notes: updatedNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', claim.id);

      // Transition claim to closed status
      await transitionClaim(claim.id, 'closed', 'Client feedback collected and claim ready for closure');

      toast({
        title: "Feedback Collected",
        description: "Client feedback has been recorded and claim is ready for closure"
      });

      onStepComplete();
    } catch (error) {
      console.error('Error collecting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to collect client feedback",
        variant: "destructive"
      });
    }
  };

  const confirmationCompleted = Object.values(clientConfirmation).filter(Boolean).length;
  const totalConfirmations = Object.keys(clientConfirmation).length;
  const canProceed = confirmationCompleted >= totalConfirmations * 0.75 && feedbackCollected;

  return (
    <div className="space-y-6">
      {/* Claim Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Client Feedback Collection
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
              <label className="font-medium">Settlement Amount:</label>
              <p className="text-muted-foreground">₦{claim.settlement_amount?.toLocaleString() || '0'}</p>
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
        {/* Client Confirmation Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Settlement Confirmation
              </div>
              <Badge variant="outline">
                {confirmationCompleted}/{totalConfirmations} Confirmed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(clientConfirmation).map(([key, confirmed]) => (
              <div key={key} className="flex items-center space-x-3">
                <Switch
                  checked={confirmed}
                  onCheckedChange={() => handleConfirmationUpdate(key as keyof typeof clientConfirmation)}
                />
                <label className="text-sm font-medium cursor-pointer">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
            ))}

            <div className="flex items-center space-x-3 pt-4 border-t">
              <Switch
                checked={feedbackCollected}
                onCheckedChange={setFeedbackCollected}
              />
              <label className="text-sm font-medium cursor-pointer">
                Feedback Form Completed
              </label>
            </div>
            
            <div className={`p-3 rounded-lg ${canProceed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${canProceed ? 'text-green-800' : 'text-yellow-800'}`}>
                {canProceed 
                  ? '✓ Client confirmation completed - Ready to close claim'
                  : `Complete ${Math.ceil(totalConfirmations * 0.75) - confirmationCompleted} more confirmations and feedback`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Satisfaction & Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Client Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Overall Satisfaction Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={clientSatisfaction === rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => setClientSatisfaction(rating as 1 | 2 | 3 | 4 | 5)}
                    className="w-12 h-12"
                  >
                    <Star className={`h-4 w-4 ${clientSatisfaction >= rating ? 'fill-current' : ''}`} />
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {clientSatisfaction === 5 ? 'Excellent' : 
                 clientSatisfaction === 4 ? 'Good' : 
                 clientSatisfaction === 3 ? 'Average' : 
                 clientSatisfaction === 2 ? 'Poor' : 'Very Poor'}
              </p>
            </div>

            <div>
              <Label>Client Comments</Label>
              <Textarea
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                placeholder="Record client's feedback about the claims process, service quality, and overall experience..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Improvement Suggestions</Label>
              <Textarea
                value={improvementSuggestions}
                onChange={(e) => setImprovementSuggestions(e.target.value)}
                placeholder="Any suggestions from client for improving our claims process..."
                rows={3}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Services Interest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Additional Services Interest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {serviceOptions.map((service) => (
              <div key={service} className="flex items-center space-x-3">
                <Switch
                  checked={additionalServices.includes(service)}
                  onCheckedChange={() => handleServiceToggle(service)}
                />
                <label className="text-sm cursor-pointer">
                  {service}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="flex items-center space-x-3">
              <Switch
                checked={followUpRequired}
                onCheckedChange={setFollowUpRequired}
              />
              <label className="text-sm font-medium cursor-pointer">
                Schedule Follow-up Call
              </label>
            </div>
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
              onClick={handleCloseClaim}
              disabled={!canProceed || loading}
            >
              {loading ? 'Processing...' : 'Complete Feedback & Proceed to Closure'}
            </Button>
          </div>
          
          {!canProceed && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground text-center">Complete all requirements to proceed:</p>
              <div className="text-xs text-center space-x-4">
                <span className={confirmationCompleted >= totalConfirmations * 0.75 ? 'text-green-600' : 'text-yellow-600'}>
                  Client Confirmations {confirmationCompleted >= totalConfirmations * 0.75 ? '✓' : '○'}
                </span>
                <span className={feedbackCollected ? 'text-green-600' : 'text-yellow-600'}>
                  Feedback Collected {feedbackCollected ? '✓' : '○'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Claim Closure Stage Component
interface ClaimClosureStageProps {
  claim: Claim;
  policyDetails: { insurer: string; premium: number; sum_insured: number } | null;
  onStepComplete: () => void;
}

const ClaimClosureStage = ({ claim, policyDetails, onStepComplete }: ClaimClosureStageProps) => {
  const { toast } = useToast();
  const [closureNotes, setClosureNotes] = useState('');
  const [archiveDocuments, setArchiveDocuments] = useState(true);
  const [finalReports, setFinalReports] = useState({
    claimSummaryGenerated: false,
    financialReportCompleted: false,
    complianceCheckCompleted: false,
    auditTrailValidated: false
  });
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [processImprovements, setProcessImprovements] = useState('');

  const handleFinalReportUpdate = (key: keyof typeof finalReports) => {
    setFinalReports(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleClosureFinal = async () => {
    try {
      // Generate final closure documentation
      const closureData = {
        closed_date: new Date().toISOString(),
        closure_notes: closureNotes,
        archive_documents: archiveDocuments,
        final_reports: finalReports,
        lessons_learned: lessonsLearned,
        process_improvements: processImprovements,
        final_settlement: claim.settlement_amount || 0
      };

      // Update claim with final closure details
      const finalNotes = `${claim.notes || ''}\n\n--- CLAIM CLOSURE COMPLETED ---\nClosure Date: ${new Date().toLocaleDateString()}\nFinal Settlement: ₦${(claim.settlement_amount || 0).toLocaleString()}\nArchive Documents: ${archiveDocuments ? 'Yes' : 'No'}\n\nClosure Notes:\n${closureNotes}${lessonsLearned ? `\n\nLessons Learned:\n${lessonsLearned}` : ''}${processImprovements ? `\n\nProcess Improvements:\n${processImprovements}` : ''}\n\n--- CLAIM OFFICIALLY CLOSED ---`;

      await supabase
        .from('claims')
        .update({ 
          notes: finalNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', claim.id);

      // Log final audit entry
      await supabase
        .from('claim_audit_trail')
        .insert({
          claim_id: claim.id,
          organization_id: claim.organization_id,
          action: 'claim_closed',
          stage: 'closure',
          details: closureData
        });

      toast({
        title: "Claim Officially Closed",
        description: "All closure procedures completed and documented"
      });

      onStepComplete();
    } catch (error) {
      console.error('Error closing claim:', error);
      toast({
        title: "Error",
        description: "Failed to complete claim closure",
        variant: "destructive"
      });
    }
  };

  const reportsCompleted = Object.values(finalReports).filter(Boolean).length;
  const totalReports = Object.keys(finalReports).length;
  const canClose = reportsCompleted === totalReports && closureNotes.trim();

  return (
    <div className="space-y-6">
      {/* Claim Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Claim Closure - Final Documentation
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
              <label className="font-medium">Final Settlement:</label>
              <p className="text-green-600 font-medium">₦{claim.settlement_amount?.toLocaleString() || '0'}</p>
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
        {/* Final Reports Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Final Reports & Documentation
              </div>
              <Badge variant={reportsCompleted === totalReports ? "secondary" : "outline"}>
                {reportsCompleted}/{totalReports} Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(finalReports).map(([key, completed]) => (
              <div key={key} className="flex items-center space-x-3">
                <Switch
                  checked={completed}
                  onCheckedChange={() => handleFinalReportUpdate(key as keyof typeof finalReports)}
                />
                <label className="text-sm font-medium cursor-pointer">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={archiveDocuments}
                  onCheckedChange={setArchiveDocuments}
                />
                <label className="text-sm font-medium cursor-pointer">
                  Archive All Documents
                </label>
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${reportsCompleted === totalReports ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${reportsCompleted === totalReports ? 'text-green-800' : 'text-yellow-800'}`}>
                {reportsCompleted === totalReports 
                  ? '✓ All final reports completed'
                  : `Complete ${totalReports - reportsCompleted} more reports`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Process Improvement Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Process Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Lessons Learned</Label>
              <Textarea
                value={lessonsLearned}
                onChange={(e) => setLessonsLearned(e.target.value)}
                placeholder="Document any lessons learned during this claim process..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Process Improvement Suggestions</Label>
              <Textarea
                value={processImprovements}
                onChange={(e) => setProcessImprovements(e.target.value)}
                placeholder="Suggest improvements to our claims handling process based on this case..."
                rows={4}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final Closure Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Final Closure Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Closure Summary</Label>
            <Textarea
              value={closureNotes}
              onChange={(e) => setClosureNotes(e.target.value)}
              placeholder="Provide a comprehensive summary of the claim closure, including key outcomes, client satisfaction, and final resolution..."
              rows={6}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Claim Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {Math.round(((claim.settlement_amount || 0) / (claim.estimated_loss || 1)) * 100)}%
              </div>
              <div className="text-sm text-blue-600">Settlement Ratio</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {Math.round((new Date().getTime() - new Date(claim.created_at || '').getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-green-600">Days to Close</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                ₦{claim.settlement_amount?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-purple-600">Final Settlement</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {claim.status === 'closed' ? 'Closed' : 'Processing'}
              </div>
              <div className="text-sm text-orange-600">Final Status</div>
            </div>
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
            >
              <Download className="h-4 w-4 mr-2" />
              Download Closure Report
            </Button>
            <Button
              className="flex-1"
              onClick={handleClosureFinal}
              disabled={!canClose}
              variant="default"
            >
              Finalize Claim Closure
            </Button>
          </div>
          
          {!canClose && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground text-center">Complete all requirements to finalize closure:</p>
              <div className="text-xs text-center space-x-4">
                <span className={reportsCompleted === totalReports ? 'text-green-600' : 'text-yellow-600'}>
                  Final Reports {reportsCompleted === totalReports ? '✓' : '○'}
                </span>
                <span className={closureNotes.trim() ? 'text-green-600' : 'text-yellow-600'}>
                  Closure Notes {closureNotes.trim() ? '✓' : '○'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};