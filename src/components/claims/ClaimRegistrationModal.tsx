
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PolicyService } from "@/services/database/policyService";
import { ClaimWorkflowService } from "@/services/database/claimWorkflowService";

interface ClaimRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaimCreated?: () => void;
}

interface ClaimDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
}

export const ClaimRegistrationModal = ({ open, onOpenChange, onClaimCreated }: ClaimRegistrationModalProps) => {
  const [formData, setFormData] = useState({
    policyId: "",
    policyNumber: "",
    clientName: "",
    claimType: "",
    lossDate: "",
    reportedDate: new Date().toISOString().split('T')[0],
    estimatedLoss: "",
    description: "",
    location: ""
  });
  const [documents, setDocuments] = useState<ClaimDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPolicies();
    }
  }, [open]);

  const loadPolicies = async () => {
    try {
      const policiesData = await PolicyService.getAll();
      setPolicies(policiesData.filter(p => p.status === 'active'));
    } catch (error) {
      console.error('Error loading policies:', error);
      toast({
        title: "Error",
        description: "Failed to load policies",
        variant: "destructive"
      });
    }
  };

  const filteredPolicies = policies.filter(policy => 
    policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectPolicy = (policy: any) => {
    setFormData({
      ...formData,
      policyId: policy.id,
      policyNumber: policy.policy_number,
      clientName: policy.client_name
    });
    setSearchTerm(policy.policy_number);
    setIsDropdownOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const uploadedDocs: ClaimDocument[] = [];
      
      for (const file of Array.from(files)) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds 10MB limit`,
            variant: "destructive"
          });
          continue;
        }

        const newDoc: ClaimDocument = {
          id: `doc-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString()
        };
        uploadedDocs.push(newDoc);
      }

      setDocuments(prev => [...prev, ...uploadedDocs]);
      
      if (uploadedDocs.length > 0) {
        toast({
          title: "Documents Uploaded",
          description: `${uploadedDocs.length} document(s) uploaded successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Some files failed to upload",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.policyId || !formData.claimType || !formData.estimatedLoss || !formData.lossDate) {
      toast({
        title: "Validation Error", 
        description: "Please fill in all required fields: Policy, Claim Type, Loss Date, and Estimated Loss",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(formData.estimatedLoss) <= 0) {
      toast({
        title: "Validation Error",
        description: "Estimated loss must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create claim using ClaimWorkflowService
      const claimData = {
        client_name: formData.clientName,
        policy_number: formData.policyNumber,
        claim_type: formData.claimType,
        incident_date: formData.lossDate,
        description: formData.description || undefined,
        estimated_loss: parseFloat(formData.estimatedLoss)
      };

      const newClaim = await ClaimWorkflowService.createWithWorkflow(claimData);

      toast({
        title: "Claim Registered Successfully",
        description: `Claim ${newClaim.claim_number} has been registered and assigned for investigation.`,
      });

      // Reset form
      setFormData({
        policyId: "",
        policyNumber: "",
        clientName: "",
        claimType: "",
        lossDate: "",
        reportedDate: new Date().toISOString().split('T')[0],
        estimatedLoss: "",
        description: "",
        location: ""
      });
      setDocuments([]);
      setSearchTerm("");
      onOpenChange(false);
      
      // Notify parent to refresh claims list
      if (onClaimCreated) {
        onClaimCreated();
      }

    } catch (error) {
      console.error('Error creating claim:', error);
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
              <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isDropdownOpen}
                    className="w-full justify-between"
                  >
                    {formData.policyNumber || "Select policy..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search policies..." 
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>No policies found.</CommandEmpty>
                      <CommandGroup>
                        {filteredPolicies.map((policy) => (
                          <CommandItem
                            key={policy.id}
                            value={policy.policy_number}
                            onSelect={() => selectPolicy(policy)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{policy.policy_number}</span>
                              <span className="text-sm text-gray-500">{policy.client_name}</span>
                              <span className="text-xs text-gray-400">{policy.policy_type}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.clientName && (
                <p className="text-sm text-gray-600 mt-1">Client: {formData.clientName}</p>
              )}
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
              <Label htmlFor="lossDate">Date of Loss *</Label>
              <Input
                id="lossDate"
                type="date"
                value={formData.lossDate}
                onChange={(e) => setFormData({...formData, lossDate: e.target.value})}
                max={new Date().toISOString().split('T')[0]}
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
                    disabled={isUploading}
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" disabled={isUploading}>
                      {isUploading ? "Uploading..." : "Choose Files"}
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
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isUploading || !formData.policyId}
          >
            {isSubmitting ? "Registering..." : "Register Claim"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
