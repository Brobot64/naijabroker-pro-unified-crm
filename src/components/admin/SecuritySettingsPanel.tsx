
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSecuritySettings } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";

export const SecuritySettingsPanel = () => {
  const { settings, loading, hasUnsavedChanges, updateSettings, saveSettings } = useSecuritySettings();
  const { toast } = useToast();

  if (loading || !settings) {
    return <div>Loading security settings...</div>;
  }

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ ...settings, [key]: value });
  };

  const handleNumberChange = (key: keyof typeof settings, value: number) => {
    updateSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    await saveSettings();
    toast({
      title: "Security Settings Updated",
      description: "Your security settings have been successfully saved.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Security Settings</CardTitle>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
              Unsaved Changes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sso">Single Sign-On (SSO)</Label>
              <Switch 
                id="sso"
                checked={settings.ssoEnabled}
                onCheckedChange={(checked) => handleToggle('ssoEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="mfa">Multi-Factor Authentication</Label>
              <Switch 
                id="mfa"
                checked={settings.mfaRequired}
                onCheckedChange={(checked) => handleToggle('mfaRequired', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ipRestriction">IP Restriction</Label>
              <Switch 
                id="ipRestriction"
                checked={settings.ipRestriction}
                onCheckedChange={(checked) => handleToggle('ipRestriction', checked)}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="passwordExpiry">Password Expiry (Days)</Label>
              <Input 
                id="passwordExpiry"
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => handleNumberChange('passwordExpiry', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
              <Input 
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleNumberChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className="w-full md:w-auto"
        >
          {hasUnsavedChanges ? 'Save Security Settings' : 'Settings Saved'}
        </Button>
      </CardContent>
    </Card>
  );
};
