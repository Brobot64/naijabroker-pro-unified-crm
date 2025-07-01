
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

interface ClientOnboardingProps {
  onClientCreated: (clientId: string, clientData: any) => void;
  onCancel: () => void;
}

export const ClientOnboarding = ({ onClientCreated, onCancel }: ClientOnboardingProps) => {
  const [clientData, setClientData] = useState({
    // Basic Details
    clientCode: `CLI-${Date.now().toString().slice(-6)}`,
    name: "",
    address: "",
    phone: "",
    email: "",
    source: "",
    industry: "",
    classification: "",
    remark: "",
    accountOfficer: "",
    
    // Additional Info
    chairman: "",
    md: "",
    headOfFinance: "",
    
    // Contact Details
    contactName: "",
    contactAddress: "",
    birthday: "",
    anniversary: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!clientData.name || !clientData.email || !clientData.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Email, Phone)",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically save to a clients table
      // For now, we'll simulate creating a client
      const clientId = `client-${Date.now()}`;
      
      toast({
        title: "Client Created",
        description: `Client ${clientData.name} has been successfully onboarded`,
      });

      onClientCreated(clientId, clientData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Client Onboarding</h2>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>

      {/* Basic Details */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Client Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientCode">Client Code *</Label>
              <Input
                id="clientCode"
                value={clientData.clientCode}
                onChange={(e) => setClientData({...clientData, clientCode: e.target.value})}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="accountOfficer">Account Officer</Label>
              <Input
                id="accountOfficer"
                value={clientData.accountOfficer}
                onChange={(e) => setClientData({...clientData, accountOfficer: e.target.value})}
                placeholder="Account officer name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={clientData.name}
                onChange={(e) => setClientData({...clientData, name: e.target.value})}
                placeholder="Full company/individual name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={clientData.email}
                onChange={(e) => setClientData({...clientData, email: e.target.value})}
                placeholder="contact@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={clientData.phone}
                onChange={(e) => setClientData({...clientData, phone: e.target.value})}
                placeholder="+234XXXXXXXXXX"
              />
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Select value={clientData.source} onValueChange={(value) => setClientData({...clientData, source: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="How did they find us?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="cold_call">Cold Call</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={clientData.industry} onValueChange={(value) => setClientData({...clientData, industry: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="classification">Classification</Label>
              <Select value={clientData.classification} onValueChange={(value) => setClientData({...clientData, classification: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Client classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="sme">SME</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={clientData.address}
              onChange={(e) => setClientData({...clientData, address: e.target.value})}
              placeholder="Full business address"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="remark">Remarks</Label>
            <Textarea
              id="remark"
              value={clientData.remark}
              onChange={(e) => setClientData({...clientData, remark: e.target.value})}
              placeholder="Additional notes about the client"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Key Personnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="chairman">Chairman</Label>
              <Input
                id="chairman"
                value={clientData.chairman}
                onChange={(e) => setClientData({...clientData, chairman: e.target.value})}
                placeholder="Chairman name"
              />
            </div>
            <div>
              <Label htmlFor="md">Managing Director</Label>
              <Input
                id="md"
                value={clientData.md}
                onChange={(e) => setClientData({...clientData, md: e.target.value})}
                placeholder="MD name"
              />
            </div>
            <div>
              <Label htmlFor="headOfFinance">Head of Finance</Label>
              <Input
                id="headOfFinance"
                value={clientData.headOfFinance}
                onChange={(e) => setClientData({...clientData, headOfFinance: e.target.value})}
                placeholder="Finance head name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactName">Contact Person</Label>
              <Input
                id="contactName"
                value={clientData.contactName}
                onChange={(e) => setClientData({...clientData, contactName: e.target.value})}
                placeholder="Primary contact name"
              />
            </div>
            <div>
              <Label htmlFor="contactAddress">Contact Address</Label>
              <Input
                id="contactAddress"
                value={clientData.contactAddress}
                onChange={(e) => setClientData({...clientData, contactAddress: e.target.value})}
                placeholder="Contact person address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={clientData.birthday}
                onChange={(e) => setClientData({...clientData, birthday: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="anniversary">Anniversary</Label>
              <Input
                id="anniversary"
                type="date"
                value={clientData.anniversary}
                onChange={(e) => setClientData({...clientData, anniversary: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating Client..." : "Create Client & Continue to Quote"}
        </Button>
      </div>
    </div>
  );
};
