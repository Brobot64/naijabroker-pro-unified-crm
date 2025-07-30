import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Upload, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClaimPortalData {
  id: string;
  claim_id: string;
  client_id: string;
  claim_data: any;
  expires_at: string;
  is_used: boolean;
}

export default function ClaimPortal() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [portalData, setPortalData] = useState<ClaimPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    witnessName: '',
    witnessPhone: '',
    policeReport: '',
    additionalInfo: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError('No portal token provided');
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase
        .from('claim_portal_links')
        .select('*')
        .eq('token', token)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        setError('Invalid or expired portal link');
        return;
      }

      setPortalData(data);
    } catch (err) {
      setError('Failed to validate portal link');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const newFiles = Array.from(files);
    
    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024;
    const invalidFiles = newFiles.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast.error(`Files too large: ${invalidFiles.map(f => f.name).join(', ')}. Max size: 10MB`);
      setUploading(false);
      return;
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploading(false);
    toast.success(`${newFiles.length} file(s) added`);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalData) return;

    setSubmitting(true);
    try {
      let fileUrls: string[] = [];
      
      // Upload files if any
      if (uploadedFiles.length > 0) {
        const uploadPromises = uploadedFiles.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${portalData.claim_id}/${Date.now()}_${index}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('claim-documents')
            .upload(fileName, file);
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('claim-documents')
            .getPublicUrl(fileName);
            
          return publicUrl;
        });
        
        fileUrls = await Promise.all(uploadPromises);
      }

      // Update the claim with additional information
      const { error: updateError } = await supabase
        .from('claims')
        .update({
          description: formData.description || portalData.claim_data.description,
          notes: `Client Portal Submission:\n\nAdditional Details: ${formData.additionalInfo}\nWitness: ${formData.witnessName} (${formData.witnessPhone})\nPolice Report: ${formData.policeReport}\n\n${fileUrls.length > 0 ? `Uploaded Documents:\n${fileUrls.join('\n')}\n\n` : ''}Submitted via client portal.`,
          updated_at: new Date().toISOString()
        })
        .eq('id', portalData.claim_id);

      if (updateError) throw updateError;

      // Mark portal link as used
      const { error: markUsedError } = await supabase
        .from('claim_portal_links')
        .update({ is_used: true })
        .eq('id', portalData.id);

      if (markUsedError) throw markUsedError;

      toast.success('Claim information submitted successfully!');
      
      // Show success state
      setPortalData({ ...portalData, is_used: true });
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Failed to submit claim information');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating portal access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (portalData?.is_used) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Submission Complete</h1>
              <p className="text-gray-600">Your claim information has been submitted successfully. Our team will review your submission and contact you soon.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const claimData = portalData?.claim_data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim Portal</h1>
          <p className="text-gray-600">Complete your claim registration</p>
        </div>

        <div className="grid gap-6">
          {/* Claim Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Claim Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Claim Number</label>
                  <p className="font-semibold">{claimData?.claim_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Client Name</label>
                  <p className="font-semibold">{claimData?.client_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Claim Type</label>
                  <p className="font-semibold">{claimData?.claim_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Loss</label>
                  <p className="font-semibold">{new Date(claimData?.incident_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              {claimData?.description && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Initial Description</label>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{claimData.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="description">Detailed Description of Incident</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide a detailed description of what happened..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="witnessName">Witness Name (if any)</Label>
                    <Input
                      id="witnessName"
                      placeholder="Full name of witness"
                      value={formData.witnessName}
                      onChange={(e) => setFormData({ ...formData, witnessName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="witnessPhone">Witness Phone</Label>
                    <Input
                      id="witnessPhone"
                      placeholder="Phone number"
                      value={formData.witnessPhone}
                      onChange={(e) => setFormData({ ...formData, witnessPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="policeReport">Police Report Reference (if applicable)</Label>
                  <Input
                    id="policeReport"
                    placeholder="Police report number or reference"
                    value={formData.policeReport}
                    onChange={(e) => setFormData({ ...formData, policeReport: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any other relevant information about the incident..."
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* File Upload Section */}
                <div>
                  <Label>Supporting Documents</Label>
                  <div className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Click to upload files or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG, DOCX up to 10MB each
                      </p>
                      <input
                        id="file-upload"
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
                        <p className="text-sm font-medium">Uploaded Files:</p>
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
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Submitting...' : 'Submit Claim Information'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card>
            <CardContent className="pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• All information provided will be reviewed by our claims team</li>
                  <li>• You may be contacted for additional documentation</li>
                  <li>• This portal link expires in 72 hours from generation</li>
                  <li>• For urgent matters, please contact your broker directly</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}