import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AdminConfigService, AdminConfigOption, AccountOfficer } from "@/services/database/adminConfigService";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit, Trash2 } from "lucide-react";

export const ClientConfigurationSettings = () => {
  const { toast } = useToast();
  const { organizationId } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [classifications, setClassifications] = useState<AdminConfigOption[]>([]);
  const [industries, setIndustries] = useState<AdminConfigOption[]>([]);
  const [sources, setSources] = useState<AdminConfigOption[]>([]);
  const [accountOfficers, setAccountOfficers] = useState<AccountOfficer[]>([]);

  const [newClassification, setNewClassification] = useState({ value: '', label: '' });
  const [newIndustry, setNewIndustry] = useState({ value: '', label: '' });
  const [newSource, setNewSource] = useState({ value: '', label: '' });
  const [newOfficer, setNewOfficer] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load configuration data",
        variant: "destructive"
      });
    }
  };

  const handleAddClassification = async () => {
    if (!newClassification.value.trim() || !newClassification.label.trim() || !organizationId) return;
    
    setLoading(true);
    try {
      await AdminConfigService.createClassification({
        organization_id: organizationId,
        value: newClassification.value.toLowerCase().replace(/\s+/g, '-'),
        label: newClassification.label,
        sort_order: classifications.length + 1
      });
      
      setNewClassification({ value: '', label: '' });
      loadData();
      toast({
        title: "Success",
        description: "Classification added successfully"
      });
    } catch (error) {
      console.error('Error adding classification:', error);
      toast({
        title: "Error",
        description: "Failed to add classification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIndustry = async () => {
    if (!newIndustry.value.trim() || !newIndustry.label.trim() || !organizationId) return;
    
    setLoading(true);
    try {
      await AdminConfigService.createIndustry({
        organization_id: organizationId,
        value: newIndustry.value.toLowerCase().replace(/\s+/g, '-'),
        label: newIndustry.label,
        sort_order: industries.length + 1
      });
      
      setNewIndustry({ value: '', label: '' });
      loadData();
      toast({
        title: "Success",
        description: "Industry added successfully"
      });
    } catch (error) {
      console.error('Error adding industry:', error);
      toast({
        title: "Error",
        description: "Failed to add industry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async () => {
    if (!newSource.value.trim() || !newSource.label.trim() || !organizationId) return;
    
    setLoading(true);
    try {
      await AdminConfigService.createSource({
        organization_id: organizationId,
        value: newSource.value.toLowerCase().replace(/\s+/g, '-'),
        label: newSource.label,
        sort_order: sources.length + 1
      });
      
      setNewSource({ value: '', label: '' });
      loadData();
      toast({
        title: "Success",
        description: "Source added successfully"
      });
    } catch (error) {
      console.error('Error adding source:', error);
      toast({
        title: "Error",
        description: "Failed to add source",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddOfficer = async () => {
    if (!newOfficer.name.trim() || !organizationId) return;
    
    setLoading(true);
    try {
      await AdminConfigService.createAccountOfficer({
        organization_id: organizationId,
        name: newOfficer.name,
        email: newOfficer.email || undefined,
        phone: newOfficer.phone || undefined
      });
      
      setNewOfficer({ name: '', email: '', phone: '' });
      loadData();
      toast({
        title: "Success",
        description: "Account Officer added successfully"
      });
    } catch (error) {
      console.error('Error adding account officer:', error);
      toast({
        title: "Error",
        description: "Failed to add account officer",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    try {
      switch (type) {
        case 'classification':
          await AdminConfigService.deleteClassification(id);
          break;
        case 'industry':
          await AdminConfigService.deleteIndustry(id);
          break;
        case 'source':
          await AdminConfigService.deleteSource(id);
          break;
        case 'officer':
          await AdminConfigService.deleteAccountOfficer(id);
          break;
      }
      
      loadData();
      toast({
        title: "Success",
        description: "Item deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Configuration Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="classifications">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="classifications">Classifications</TabsTrigger>
            <TabsTrigger value="industries">Industries</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="officers">Account Officers</TabsTrigger>
          </TabsList>

          <TabsContent value="classifications" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="classification-value">Value</Label>
                <Input
                  id="classification-value"
                  value={newClassification.value}
                  onChange={(e) => setNewClassification({...newClassification, value: e.target.value})}
                  placeholder="e.g., corporate"
                />
              </div>
              <div>
                <Label htmlFor="classification-label">Display Label</Label>
                <Input
                  id="classification-label"
                  value={newClassification.label}
                  onChange={(e) => setNewClassification({...newClassification, label: e.target.value})}
                  placeholder="e.g., Corporate"
                />
              </div>
            </div>
            <Button onClick={handleAddClassification} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Classification
            </Button>
            
            <div className="space-y-2">
              {classifications.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{item.label}</span>
                    <span className="text-sm text-gray-500 ml-2">({item.value})</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete('classification', item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="industries" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry-value">Value</Label>
                <Input
                  id="industry-value"
                  value={newIndustry.value}
                  onChange={(e) => setNewIndustry({...newIndustry, value: e.target.value})}
                  placeholder="e.g., manufacturing"
                />
              </div>
              <div>
                <Label htmlFor="industry-label">Display Label</Label>
                <Input
                  id="industry-label"
                  value={newIndustry.label}
                  onChange={(e) => setNewIndustry({...newIndustry, label: e.target.value})}
                  placeholder="e.g., Manufacturing"
                />
              </div>
            </div>
            <Button onClick={handleAddIndustry} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Industry
            </Button>
            
            <div className="space-y-2">
              {industries.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{item.label}</span>
                    <span className="text-sm text-gray-500 ml-2">({item.value})</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete('industry', item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source-value">Value</Label>
                <Input
                  id="source-value"
                  value={newSource.value}
                  onChange={(e) => setNewSource({...newSource, value: e.target.value})}
                  placeholder="e.g., referral"
                />
              </div>
              <div>
                <Label htmlFor="source-label">Display Label</Label>
                <Input
                  id="source-label"
                  value={newSource.label}
                  onChange={(e) => setNewSource({...newSource, label: e.target.value})}
                  placeholder="e.g., Referral"
                />
              </div>
            </div>
            <Button onClick={handleAddSource} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
            
            <div className="space-y-2">
              {sources.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{item.label}</span>
                    <span className="text-sm text-gray-500 ml-2">({item.value})</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete('source', item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="officers" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="officer-name">Name *</Label>
                <Input
                  id="officer-name"
                  value={newOfficer.name}
                  onChange={(e) => setNewOfficer({...newOfficer, name: e.target.value})}
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <Label htmlFor="officer-email">Email</Label>
                <Input
                  id="officer-email"
                  type="email"
                  value={newOfficer.email}
                  onChange={(e) => setNewOfficer({...newOfficer, email: e.target.value})}
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <Label htmlFor="officer-phone">Phone</Label>
                <Input
                  id="officer-phone"
                  value={newOfficer.phone}
                  onChange={(e) => setNewOfficer({...newOfficer, phone: e.target.value})}
                  placeholder="+234..."
                />
              </div>
            </div>
            <Button onClick={handleAddOfficer} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account Officer
            </Button>
            
            <div className="space-y-2">
              {accountOfficers.map((officer) => (
                <div key={officer.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{officer.name}</span>
                    {officer.email && <span className="text-sm text-gray-500 ml-2">{officer.email}</span>}
                    {officer.phone && <span className="text-sm text-gray-500 ml-2">{officer.phone}</span>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete('officer', officer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};