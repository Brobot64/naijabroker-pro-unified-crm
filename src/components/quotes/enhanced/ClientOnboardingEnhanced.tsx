import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useWorkflowContext } from '../QuoteWorkflowProvider';
import { useToast } from "@/hooks/use-toast";
import { ClientService } from '@/services/database/clientService';
import { useAuth } from '@/contexts/AuthContext';
import { AdminConfigService, AdminConfigOption, AccountOfficer } from '@/services/database/adminConfigService';

interface ClientOnboardingEnhancedProps {
  onClientSelected: (client: any) => void;
  onBack: () => void;
}

export const ClientOnboardingEnhanced = ({ onClientSelected, onBack }: ClientOnboardingEnhancedProps) => {
  const { state, dispatch } = useWorkflowContext();
  const { organizationId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isNewClient, setIsNewClient] = useState(true);
  
  // Admin configuration data
  const [classifications, setClassifications] = useState<AdminConfigOption[]>([]);
  const [industries, setIndustries] = useState<AdminConfigOption[]>([]);
  const [sources, setSources] = useState<AdminConfigOption[]>([]);
  const [accountOfficers, setAccountOfficers] = useState<AccountOfficer[]>([]);

  const [formData, setFormData] = useState({
    client_type: 'company' as 'company' | 'individual',
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_name: '',
    contact_address: '',
    contact_phone: '',
    contact_email: '',
    classification: '',
    industry: '',
    source: '',
    account_officer: '',
    chairman: '',
    chairman_phone: '',
    chairman_email: '',
    chairman_birthday: '',
    md: '',
    md_phone: '',
    md_email: '',
    md_birthday: '',
    head_of_finance: '',
    head_of_finance_phone: '',
    head_of_finance_email: '',
    head_of_finance_birthday: '',
    birthday: '',
    anniversary: '',
    contact_birthday: '',
    contact_anniversary: '',
    remark: '',
  });

  useEffect(() => {
    loadClients();
    loadAdminData();
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

  const loadAdminData = async () => {
    try {
      const [classificationsData, industriesData, sourcesData, officersData] = await Promise.all([
        AdminConfigService.getClassifications(),
        AdminConfigService.getIndustries(),
        AdminConfigService.getSources(),
        AdminConfigService.getAccountOfficers()
      ]);

      setClassifications(classificationsData);
      setIndustries(industriesData);
      setSources(sourcesData);
      setAccountOfficers(officersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Warning",
        description: "Could not load configuration data. Please check admin settings.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientTypeChange = (isCompany: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      client_type: isCompany ? 'company' : 'individual',
      // Clear company-specific fields when switching to individual
      ...(!isCompany && {
        chairman: '',
        chairman_phone: '',
        chairman_email: '',
        chairman_birthday: '',
        md: '',
        md_phone: '',
        md_email: '',
        md_birthday: '',
        head_of_finance: '',
        head_of_finance_phone: '',
        head_of_finance_email: '',
        head_of_finance_birthday: '',
        classification: '',
        industry: ''
      })
    }));
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
      client_type: 'company',
      name: '',
      email: '',
      phone: '',
      address: '',
      contact_name: '',
      contact_address: '',
      contact_phone: '',
      contact_email: '',
      classification: '',
      industry: '',
      source: '',
      account_officer: '',
      chairman: '',
      chairman_phone: '',
      chairman_email: '',
      chairman_birthday: '',
      md: '',
      md_phone: '',
      md_email: '',
      md_birthday: '',
      head_of_finance: '',
      head_of_finance_phone: '',
      head_of_finance_email: '',
      head_of_finance_birthday: '',
      birthday: '',
      anniversary: '',
      contact_birthday: '',
      contact_anniversary: '',
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

    if (!organizationId) {
      toast({
        title: "Error",
        description: "Organization not found",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      let clientData;
      
      if (isNewClient) {
        const clientWithOrgId = {
          ...formData,
          organization_id: organizationId,
          // Convert empty date strings to null to avoid database errors
          birthday: formData.birthday?.trim() || null,
          anniversary: formData.anniversary?.trim() || null,
          contact_birthday: formData.contact_birthday?.trim() || null,
          contact_anniversary: formData.contact_anniversary?.trim() || null,
          chairman_birthday: formData.chairman_birthday?.trim() || null,
          md_birthday: formData.md_birthday?.trim() || null,
          head_of_finance_birthday: formData.head_of_finance_birthday?.trim() || null,
        };
        clientData = await ClientService.create(clientWithOrgId);
        toast({
          title: "Success",
          description: `New ${formData.client_type} client created with ID: ${clientData.client_code}`,
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

  const isCompanyType = formData.client_type === 'company';

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
                    {client.client_code} - {client.name} - {client.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Client Type Toggle */}
        <div className="space-y-2">
          <Label>Client Type</Label>
          <div className="flex items-center space-x-2">
            <span className={!isCompanyType ? 'font-medium' : 'text-muted-foreground'}>Individual</span>
            <Switch
              checked={isCompanyType}
              onCheckedChange={handleClientTypeChange}
              disabled={loading}
            />
            <span className={isCompanyType ? 'font-medium' : 'text-muted-foreground'}>Company</span>
          </div>
        </div>

        <Separator />

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{isCompanyType ? 'Company Name' : 'Full Name'} *</Label>
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

            {isCompanyType && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="classification">Classification</Label>
                  <Select value={formData.classification} onValueChange={(value) => handleInputChange('classification', value)} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification..." />
                    </SelectTrigger>
                    <SelectContent>
                      {classifications.map(item => (
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
                      {industries.map(item => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source..." />
                </SelectTrigger>
                <SelectContent>
                  {sources.map(item => (
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
                  {accountOfficers.map(officer => (
                    <SelectItem key={officer.id} value={officer.name}>{officer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Only show Address for Company clients */}
          {isCompanyType && (
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={loading}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Contact Information - Only for Company clients */}
        {isCompanyType && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Person Name *</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_address">Contact Address</Label>
                <Textarea
                  id="contact_address"
                  value={formData.contact_address}
                  onChange={(e) => handleInputChange('contact_address', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Individual client specific fields - Only Birthday and Anniversary */}
        {!isCompanyType && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_birthday">Birthday</Label>
                <Input
                  id="contact_birthday"
                  type="date"
                  value={formData.contact_birthday}
                  onChange={(e) => handleInputChange('contact_birthday', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_anniversary">Anniversary</Label>
                <Input
                  id="contact_anniversary"
                  type="date"
                  value={formData.contact_anniversary}
                  onChange={(e) => handleInputChange('contact_anniversary', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Company-specific fields */}
        {isCompanyType && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company Leadership</h3>
              
              {/* Chairman */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Chairman</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chairman">Name</Label>
                    <Input
                      id="chairman"
                      value={formData.chairman}
                      onChange={(e) => handleInputChange('chairman', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chairman_phone">Phone</Label>
                    <Input
                      id="chairman_phone"
                      value={formData.chairman_phone}
                      onChange={(e) => handleInputChange('chairman_phone', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chairman_email">Email</Label>
                    <Input
                      id="chairman_email"
                      type="email"
                      value={formData.chairman_email}
                      onChange={(e) => handleInputChange('chairman_email', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chairman_birthday">Birthday</Label>
                    <Input
                      id="chairman_birthday"
                      type="date"
                      value={formData.chairman_birthday}
                      onChange={(e) => handleInputChange('chairman_birthday', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* MD */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Managing Director</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="md">Name</Label>
                    <Input
                      id="md"
                      value={formData.md}
                      onChange={(e) => handleInputChange('md', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="md_phone">Phone</Label>
                    <Input
                      id="md_phone"
                      value={formData.md_phone}
                      onChange={(e) => handleInputChange('md_phone', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="md_email">Email</Label>
                    <Input
                      id="md_email"
                      type="email"
                      value={formData.md_email}
                      onChange={(e) => handleInputChange('md_email', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="md_birthday">Birthday</Label>
                    <Input
                      id="md_birthday"
                      type="date"
                      value={formData.md_birthday}
                      onChange={(e) => handleInputChange('md_birthday', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Head of Finance */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Head of Finance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="head_of_finance">Name</Label>
                    <Input
                      id="head_of_finance"
                      value={formData.head_of_finance}
                      onChange={(e) => handleInputChange('head_of_finance', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="head_of_finance_phone">Phone</Label>
                    <Input
                      id="head_of_finance_phone"
                      value={formData.head_of_finance_phone}
                      onChange={(e) => handleInputChange('head_of_finance_phone', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="head_of_finance_email">Email</Label>
                    <Input
                      id="head_of_finance_email"
                      type="email"
                      value={formData.head_of_finance_email}
                      onChange={(e) => handleInputChange('head_of_finance_email', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="head_of_finance_birthday">Birthday</Label>
                    <Input
                      id="head_of_finance_birthday"
                      type="date"
                      value={formData.head_of_finance_birthday}
                      onChange={(e) => handleInputChange('head_of_finance_birthday', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

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