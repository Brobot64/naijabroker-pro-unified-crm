
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ClientService } from "@/services/database/clientService";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Plus } from "lucide-react";

interface ClientOnboardingProps {
  onClientSelected: (client: any) => void;
  onBack: () => void;
}

export const ClientOnboarding = ({ onClientSelected, onBack }: ClientOnboardingProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [existingClients, setExistingClients] = useState<any[]>([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, organizationId } = useAuth();

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    classification: "",
    source: "",
    chairman: "",
    md: "",
    headOfFinance: "",
    contactName: "",
    contactAddress: "",
    accountOfficer: "",
    remark: ""
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const clients = await ClientService.searchByName(searchTerm);
      setExistingClients(clients);
      
      if (clients.length === 0) {
        toast({
          title: "No clients found",
          description: `No clients found matching "${searchTerm}". You can create a new client.`
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for clients. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Client name is required",
        variant: "destructive"
      });
      return;
    }

    if (!organizationId || !user) {
      toast({
        title: "Error",
        description: "User authentication error",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const client = await ClientService.create({
        organization_id: organizationId,
        name: newClient.name,
        email: newClient.email || undefined,
        phone: newClient.phone || undefined,
        address: newClient.address || undefined,
        industry: newClient.industry || undefined,
        classification: newClient.classification || undefined,
        source: newClient.source || undefined,
        chairman: newClient.chairman || undefined,
        md: newClient.md || undefined,
        head_of_finance: newClient.headOfFinance || undefined,
        contact_name: newClient.contactName || undefined,
        contact_address: newClient.contactAddress || undefined,
        account_officer: newClient.accountOfficer || undefined,
        remark: newClient.remark || undefined,
        created_by: user.id
      });

      toast({
        title: "Client Created",
        description: `Client "${client.name}" (${client.client_code}) has been created successfully`
      });

      onClientSelected(client);
    } catch (error) {
      console.error('Client creation error:', error);
      toast({
        title: "Creation Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Client Onboarding</h2>
        <Button variant="outline" onClick={onBack}>Back</Button>
      </div>

      {/* Search Existing Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Existing Clients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              Search
            </Button>
          </div>

          {existingClients.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Search Results:</h4>
              {existingClients.map((client) => (
                <div key={client.id} className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-600">Code: {client.client_code}</p>
                    {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
                  </div>
                  <Button onClick={() => onClientSelected(client)}>
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Client */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showNewClientForm ? (
            <Button onClick={() => setShowNewClientForm(true)} variant="outline">
              Add New Client
            </Button>
          ) : (
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    placeholder="Company or individual name"
                  />
                </div>
                <div>
                  <Label htmlFor="classification">Classification</Label>
                  <Select value={newClient.classification} onValueChange={(value) => setNewClient({...newClient, classification: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="sme">SME</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    placeholder="client@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    placeholder="+234..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  placeholder="Full business address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={newClient.industry}
                    onChange={(e) => setNewClient({...newClient, industry: e.target.value})}
                    placeholder="e.g., Manufacturing, Oil & Gas"
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={newClient.source} onValueChange={(value) => setNewClient({...newClient, source: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="How did you find us?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="cold_call">Cold Call</SelectItem>
                      <SelectItem value="existing_client">Existing Client</SelectItem>
                      <SelectItem value="marketing">Marketing Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Key Personnel */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Key Personnel</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chairman">Chairman</Label>
                    <Input
                      id="chairman"
                      value={newClient.chairman}
                      onChange={(e) => setNewClient({...newClient, chairman: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="md">Managing Director</Label>
                    <Input
                      id="md"
                      value={newClient.md}
                      onChange={(e) => setNewClient({...newClient, md: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="headOfFinance">Head of Finance</Label>
                    <Input
                      id="headOfFinance"
                      value={newClient.headOfFinance}
                      onChange={(e) => setNewClient({...newClient, headOfFinance: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountOfficer">Account Officer</Label>
                    <Input
                      id="accountOfficer"
                      value={newClient.accountOfficer}
                      onChange={(e) => setNewClient({...newClient, accountOfficer: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Additional Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Primary Contact Name</Label>
                    <Input
                      id="contactName"
                      value={newClient.contactName}
                      onChange={(e) => setNewClient({...newClient, contactName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactAddress">Contact Address</Label>
                    <Input
                      id="contactAddress"
                      value={newClient.contactAddress}
                      onChange={(e) => setNewClient({...newClient, contactAddress: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="remark">Remarks</Label>
                  <Textarea
                    id="remark"
                    value={newClient.remark}
                    onChange={(e) => setNewClient({...newClient, remark: e.target.value})}
                    placeholder="Any additional notes about this client"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateClient} disabled={loading}>
                  {loading ? "Creating..." : "Create Client"}
                </Button>
                <Button variant="outline" onClick={() => setShowNewClientForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
