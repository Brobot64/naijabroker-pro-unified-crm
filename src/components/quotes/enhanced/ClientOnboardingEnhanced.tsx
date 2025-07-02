
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowContext } from '../QuoteWorkflowProvider';
import { useToast } from "@/hooks/use-toast";
import { ClientService } from '@/services/database/clientService';

interface ClientOnboardingEnhancedProps {
  onClientSelected: (client: any) => void;
  onBack: () => void;
}

// Configuration data - this will later come from database
const CLASSIFICATIONS = [
  { value: 'corporate', label: 'Corporate' },
  { value: 'sme', label: 'Small & Medium Enterprise' },
  { value: 'individual', label: 'Individual' },
  { value: 'government', label: 'Government' },
];

const INDUSTRIES = [
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'oil-gas', label: 'Oil & Gas' },
  { value: 'construction', label: 'Construction' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Financial Services' },
  { value: 'retail', label: 'Retail' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'education', label: 'Education' },
];

const SOURCES = [
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'direct-sales', label: 'Direct Sales' },
  { value: 'partner', label: 'Partner' },
  { value: 'advertisement', label: 'Advertisement' },
];

const ACCOUNT_OFFICERS = [
  { value: 'john-doe', label: 'John Doe' },
  { value: 'jane-smith', label: 'Jane Smith' },
  { value: 'mike-johnson', label: 'Mike Johnson' },
  { value: 'sarah-wilson', label: 'Sarah Wilson' },
];

export const ClientOnboardingEnhanced = ({ onClientSelected, onBack }: ClientOnboardingEnhancedProps) => {
  const { state, dispatch } = useWorkflowContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isNewClient, setIsNewClient] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_name: '',
    contact_address: '',
    classification: '',
    industry: '',
    source: '',
    account_officer: '',
    chairman: '',
    md: '',
    head_of_finance: '',
    birthday: '',
    anniversary: '',
    remark: '',
  });

  useEffect(() => {
    loadClients();
    // Load saved data if available
    if (state.workflowData.client) {
      setFormData(state.workflowData.client);
      setSelectedClient(state.workflowData.client);
      setIsNewClient(!state.workflowData.client.id);
    }
  }, []);

  const loadClients = async () => {
    try {
      const clientsData = await ClientService.getAll();
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Warning",
        description: "Could not load existing clients",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientSelection = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setFormData(client);
      setIsNewClient(false);
    }
  };

  const handleNewClient = () => {
    setSelectedClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      contact_name: '',
      contact_address: '',
      classification: '',
      industry: '',
      source: '',
      account_officer: '',
      chairman: '',
      md: '',
      head_of_finance: '',
      birthday: '',
      anniversary: '',
      remark: '',
    });
    setIsNewClient(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      let clientData;
      
      if (isNewClient) {
        clientData = await ClientService.create(formData);
        toast({
          title: "Success",
          description: "New client created successfully",
        });
      } else {
        clientData = selectedClient;
      }

      // Save to workflow state
      dispatch({ type: 'SET_DATA', payload: { key: 'client', data: clientData } });
      dispatch({ type: 'COMPLETE_STEP', payload: 'client-onboarding' });
      
      onClientSelected(clientData);
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Error",
        description: "Failed to save client information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Onboarding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Client Selection */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button 
              variant={isNewClient ? "default" : "outline"}
              onClick={handleNewClient}
            >
              New Client
            </Button>
            <Select onValueChange={handleClientSelection} disabled={loading}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Or select existing client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} - {client.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Client Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company/Client Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classification">Classification</Label>
            <Select value={formData.classification} onValueChange={(value) => handleInputChange('classification', value)} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select classification..." />
              </SelectTrigger>
              <SelectContent>
                {CLASSIFICATIONS.map(item => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry..." />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(item => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select source..." />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map(item => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_officer">Account Officer</Label>
            <Select value={formData.account_officer} onValueChange={(value) => handleInputChange('account_officer', value)} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select account officer..." />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_OFFICERS.map(item => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_name">Contact Person</Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => handleInputChange('contact_name', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="remark">Remarks</Label>
          <Textarea
            id="remark"
            value={formData.remark}
            onChange={(e) => handleInputChange('remark', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} disabled={loading}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
