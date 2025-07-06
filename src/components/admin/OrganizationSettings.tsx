import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Palette, Settings, Users, DollarSign, CreditCard, Shield, Zap } from "lucide-react";
import { ClientConfigurationSettings } from "./ClientConfigurationSettings";
import { BankAccountSettings } from "./BankAccountSettings";

interface OrganizationData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string;
  currency: string;
  timezone: string;
  business_hours: string;
  plan: string;
  industry: string;
  size: string;
}

export const OrganizationSettings = () => {
  const { organizationId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgData, setOrgData] = useState<OrganizationData | null>(null);

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationData();
    }
  }, [organizationId]);

  const fetchOrganizationData = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      setOrgData(data);
    } catch (error) {
      console.error('Error fetching organization data:', error);
      toast({
        title: "Error",
        description: "Failed to load organization settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (updates: Partial<OrganizationData>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organizationId);

      if (error) throw error;

      setOrgData(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Success",
        description: "Organization settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Failed to update organization settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBasicInfoSave = () => {
    if (!orgData) return;
    updateOrganization({
      name: orgData.name,
      email: orgData.email,
      phone: orgData.phone,
      address: orgData.address,
    });
  };

  const handleBrandingSave = () => {
    if (!orgData) return;
    updateOrganization({
      primary_color: orgData.primary_color,
      secondary_color: orgData.secondary_color,
    });
  };

  const handleSystemSave = () => {
    if (!orgData) return;
    updateOrganization({
      currency: orgData.currency,
      timezone: orgData.timezone,
      business_hours: orgData.business_hours,
    });
  };

  const handlePlanIndustrySave = () => {
    if (!orgData) return;
    updateOrganization({
      industry: orgData.industry,
      size: orgData.size,
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!orgData) {
    return <div className="p-8 text-center">No organization data found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
          <p className="text-gray-600">Manage your organization configuration and branding</p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="banks" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Bank Accounts
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={orgData.name}
                  onChange={(e) => setOrgData(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="orgEmail">Business Email</Label>
                <Input
                  id="orgEmail"
                  type="email"
                  value={orgData.email || ''}
                  onChange={(e) => setOrgData(prev => prev ? {...prev, email: e.target.value} : null)}
                  className="mt-1"
                  placeholder="info@yourcompany.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This email appears on documents and is used for official communications
                </p>
              </div>

              <div>
                <Label htmlFor="orgPhone">Business Phone</Label>
                <Input
                  id="orgPhone"
                  value={orgData.phone || ''}
                  onChange={(e) => setOrgData(prev => prev ? {...prev, phone: e.target.value} : null)}
                  className="mt-1"
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>

              <div>
                <Label htmlFor="orgAddress">Business Address</Label>
                <Input
                  id="orgAddress"
                  value={orgData.address || ''}
                  onChange={(e) => setOrgData(prev => prev ? {...prev, address: e.target.value} : null)}
                  className="mt-1"
                  placeholder="Enter your business address"
                />
              </div>

              <Button onClick={handleBasicInfoSave} disabled={saving}>
                {saving ? "Saving..." : "Save Basic Information"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-3 mt-1">
                  <input
                    type="color"
                    id="primaryColor"
                    value={orgData.primary_color}
                    onChange={(e) => setOrgData(prev => prev ? {...prev, primary_color: e.target.value} : null)}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={orgData.primary_color}
                    onChange={(e) => setOrgData(prev => prev ? {...prev, primary_color: e.target.value} : null)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center space-x-3 mt-1">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={orgData.secondary_color}
                    onChange={(e) => setOrgData(prev => prev ? {...prev, secondary_color: e.target.value} : null)}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={orgData.secondary_color}
                    onChange={(e) => setOrgData(prev => prev ? {...prev, secondary_color: e.target.value} : null)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label>Color Preview</Label>
                <div
                  className="p-6 rounded-lg border mt-2"
                  style={{
                    background: `linear-gradient(135deg, ${orgData.primary_color}15, ${orgData.secondary_color}10)`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="px-4 py-2 rounded text-white font-medium"
                      style={{ backgroundColor: orgData.primary_color }}
                    >
                      NaijaBroker Pro
                    </div>
                    <div className="text-sm" style={{ color: orgData.secondary_color }}>
                      Sample Document Header
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleBrandingSave} disabled={saving}>
                {saving ? "Saving..." : "Save Branding"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={orgData.currency} onValueChange={(value) => setOrgData(prev => prev ? {...prev, currency: value} : null)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={orgData.timezone} onValueChange={(value) => setOrgData(prev => prev ? {...prev, timezone: value} : null)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                    <SelectItem value="UTC">UTC - Coordinated Universal Time</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST/EDT)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="businessHours">Business Hours</Label>
                <Select value={orgData.business_hours} onValueChange={(value) => setOrgData(prev => prev ? {...prev, business_hours: value} : null)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select business hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8:00-16:00">8:00 AM - 4:00 PM</SelectItem>
                    <SelectItem value="9:00-17:00">9:00 AM - 5:00 PM</SelectItem>
                    <SelectItem value="8:00-17:00">8:00 AM - 5:00 PM</SelectItem>
                    <SelectItem value="9:00-18:00">9:00 AM - 6:00 PM</SelectItem>
                    <SelectItem value="24/7">24/7 Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSystemSave} disabled={saving}>
                {saving ? "Saving..." : "Save System Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <CardTitle>Plan & Industry Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="plan">Current Plan</Label>
                <Input
                  id="plan"
                  value={orgData.plan}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">Contact support to change your plan</p>
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={orgData.industry || ''} onValueChange={(value) => setOrgData(prev => prev ? {...prev, industry: value} : null)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Insurance">General Insurance</SelectItem>
                    <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                    <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                    <SelectItem value="Property Insurance">Property Insurance</SelectItem>
                    <SelectItem value="Marine Insurance">Marine Insurance</SelectItem>
                    <SelectItem value="Aviation Insurance">Aviation Insurance</SelectItem>
                    <SelectItem value="Reinsurance">Reinsurance</SelectItem>
                    <SelectItem value="Insurance Brokerage">Insurance Brokerage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="size">Organization Size</Label>
                <Select value={orgData.size || ''} onValueChange={(value) => setOrgData(prev => prev ? {...prev, size: value} : null)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select organization size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10 employees">1-10 employees</SelectItem>
                    <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                    <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                    <SelectItem value="201-500 employees">201-500 employees</SelectItem>
                    <SelectItem value="501-1000 employees">501-1000 employees</SelectItem>
                    <SelectItem value="1000+ employees">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handlePlanIndustrySave} disabled={saving}>
                {saving ? "Saving..." : "Save Plan & Industry Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client-config">
          <ClientConfigurationSettings />
        </TabsContent>

        <TabsContent value="banks">
          <BankAccountSettings />
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Configure payment processing and financial settings.</p>
              
              <div>
                <Label>Default Currency</Label>
                <Select value={orgData.currency} onValueChange={(value) => setOrgData(prev => prev ? {...prev, currency: value} : null)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => updateOrganization({ currency: orgData.currency })} disabled={saving}>
                {saving ? "Saving..." : "Save Financial Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Manage security and access control settings.</p>
              
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Security settings are currently managed at the system level. Contact support for advanced security configurations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Configure third-party integrations and API settings.</p>
              
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  Integration features will be available in future updates. This includes payment gateways, email services, and reporting tools.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};