import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Palette, Settings, Users } from "lucide-react";

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Plan & Industry
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
                <Input
                  id="currency"
                  value={orgData.currency}
                  onChange={(e) => setOrgData(prev => prev ? {...prev, currency: e.target.value} : null)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={orgData.timezone}
                  onChange={(e) => setOrgData(prev => prev ? {...prev, timezone: e.target.value} : null)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="businessHours">Business Hours</Label>
                <Input
                  id="businessHours"
                  value={orgData.business_hours}
                  onChange={(e) => setOrgData(prev => prev ? {...prev, business_hours: e.target.value} : null)}
                  className="mt-1"
                  placeholder="9:00-17:00"
                />
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
                <Input
                  id="industry"
                  value={orgData.industry || ''}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="size">Organization Size</Label>
                <Input
                  id="size"
                  value={orgData.size || ''}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};