
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminService } from "@/services/adminService";

interface ClaimRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ClaimDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
}

export const ClaimRegistrationModal = ({ open, onOpenChange }: ClaimRegistrationModalProps) => {
  const [formData, setFormData] = useState({
    policyNumber: "",
    claimType: "",
    lossDate: "",
    reportedDate: new Date().toISOString().split('T')[0],
    estimatedLoss: "",
    description: "",
    location: ""
  });
  const [documents, setDocuments] = useState<ClaimDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const newDoc: ClaimDocument = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString()
      };
      setDocuments(prev => [...prev, newDoc]);
    });

    toast({
      title: "Documents Uploaded",
      description: `${files.length} document(s) uploaded successfully`,
    });
  };

  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleSubmit = async () => {
    if (!formData.policyNumber || !formData.claimType || !formData.estimatedLoss) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Registering new claim with full audit trail:', {
        claimData: formData,
        documentsCount: documents.length,
        estimatedLoss: parseFloat(formData.estimatedLoss),
        timestamp: new Date().toISOString()
      });

      // Log claim registration for compliance audit
      adminService.logAction(
        'CLAIM_REGISTERED',
        'Claims Management',
        `New claim registered for policy ${formData.policyNumber}. Estimated loss: ₦${parseFloat(formData.estimatedLoss).toLocaleString()}`,
        'high'
      );

      // Log document uploads for audit trail
      if (documents.length > 0) {
        adminService.logAction(
          'CLAIM_DOCUMENTS_UPLOADED',
          'Claims Management',
          `${documents.length} supporting documents uploaded for claim registration`,
          'medium'
        );
      }

      toast({
        title: "Claim Registered Successfully",
        description: `Claim has been registered and assigned for investigation. Reference: CLM-${Date.now()}`,
      });

      // Reset form
      setFormData({
        policyNumber: "",
        claimType: "",
        lossDate: "",
        reportedDate: new Date().toISOString().split('T')[0],
        estimatedLoss: "",
        description: "",
        location: ""
      });
      setDocuments([]);
      onOpenChange(false);

    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register claim. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Claim with Document Upload</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="policyNumber">Policy Number *</Label>
              <Input
                id="policyNumber"
                value={formData.policyNumber}
                onChange={(e) => setFormData({...formData, policyNumber: e.target.value})}
                placeholder="POL-2024-XXXXXX"
              />
            </div>

            <div>
              <Label htmlFor="claimType">Claim Type *</Label>
              <Select value={formData.claimType} onValueChange={(value) => setFormData({...formData, claimType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select claim type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fire">Fire Damage</SelectItem>
                  <SelectItem value="motor">Motor Accident</SelectItem>
                  <SelectItem value="theft">Theft/Burglary</SelectItem>
                  <SelectItem value="cyber">Cyber Security</SelectItem>
                  <SelectItem value="liability">Public Liability</SelectItem>
                  <SelectItem value="marine">Marine Cargo</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lossDate">Date of Loss</Label>
              <Input
                id="lossDate"
                type="date"
                value={formData.lossDate}
                onChange={(e) => setFormData({...formData, lossDate: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="reportedDate">Date Reported</Label>
              <Input
                id="reportedDate"
                type="date"
                value={formData.reportedDate}
                onChange={(e) => setFormData({...formData, reportedDate: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="estimatedLoss">Estimated Loss Amount (₦) *</Label>
              <Input
                id="estimatedLoss"
                type="number"
                value={formData.estimatedLoss}
                onChange={(e) => setFormData({...formData, estimatedLoss: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="location">Loss Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Location where loss occurred"
              />
            </div>

            <div>
              <Label htmlFor="description">Loss Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detailed description of the loss or damage"
                rows={4}
              />
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Supporting Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload supporting documents
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Photos, reports, police reports, receipts, etc.
                  </p>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button type="button" variant="outline">
                      Choose Files
                    </Button>
                  </Label>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Documents ({documents.length})</h4>
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Document Requirements:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Incident report or police report</li>
                    <li>• Photos of damage/loss</li>
                    <li>• Purchase receipts/invoices</li>
                    <li>• Expert reports (if available)</li>
                    <li>• Any correspondence related to the loss</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register Claim"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
