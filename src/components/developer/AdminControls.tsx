
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { UserInvitation } from "../admin/UserInvitation";
import { AuditLogger } from "../admin/AuditLogger";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  name: string;
  email: string; 
  role: string;
  lastLogin: string;
  status: string;
  permissions: string[];
}

interface SecuritySettings {
  ssoEnabled: boolean;
  mfaRequired: boolean;
  passwordExpiry: number;
  ipRestriction: boolean;
  sessionTimeout: number;
}

export const AdminControls = () => {
  const { toast } = useToast();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    {
      id: "admin-001",
      name: "John Developer",
      email: "john@naijabroker.dev",
      role: "Super Admin",
      lastLogin: "2024-06-14 10:30",
      status: "active",
      permissions: ["all"]
    },
    {
      id: "admin-002",
      name: "Sarah SysAdmin",
      email: "sarah@naijabroker.dev", 
      role: "System Admin",
      lastLogin: "2024-06-14 09:15",
      status: "active",
      permissions: ["system", "users", "billing"]
    },
    {
      id: "admin-003",
      name: "Mike Support",
      email: "mike@naijabroker.dev",
      role: "Support Engineer",
      lastLogin: "2024-06-13 16:45",
      status: "active",
      permissions: ["support", "logs"]
    }
  ]);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    ssoEnabled: true,
    mfaRequired: true,
    passwordExpiry: 90,
    ipRestriction: true,
    sessionTimeout: 480
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSecuritySetting = (key: keyof SecuritySettings, value: boolean | number) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const saveSecuritySettings = () => {
    // Simulate API call to save settings
    console.log('Saving security settings:', securitySettings);
    
    toast({
      title: "Security Settings Updated",
      description: "Your security settings have been successfully saved.",
    });
    
    setHasUnsavedChanges(false);
    
    // Log the action for audit purposes
    console.log('AUDIT: Security settings updated by admin user');
  };

  const handleInviteAdminUsers = (invitedUsers: any[]) => {
    const newAdminUsers = invitedUsers.map((user, index) => ({
      id: `admin-${String(adminUsers.length + index + 1).padStart(3, '0')}`,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role === 'SuperAdmin' ? 'Super Admin' : 
            user.role === 'BrokerAdmin' ? 'System Admin' : 'Support Engineer',
      lastLogin: "Never",
      status: "pending",
      permissions: user.role === 'SuperAdmin' ? ["all"] : ["support", "logs"]
    }));
    
    setAdminUsers([...adminUsers, ...newAdminUsers]);
    setShowInviteDialog(false);
    
    toast({
      title: "Admin Users Invited",
      description: `Successfully invited ${invitedUsers.length} admin user(s).`,
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Super Admin":
        return "bg-red-100 text-red-800";
      case "System Admin":
        return "bg-blue-100 text-blue-800";
      case "Support Engineer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Admin Controls & Security</h2>
        <div className="flex space-x-2">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>Add Admin User</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <UserInvitation onInvite={handleInviteAdminUsers} onClose={() => setShowInviteDialog(false)} />
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => setShowAuditLogs(!showAuditLogs)}>
            {showAuditLogs ? 'Hide' : 'View'} Audit Logs
          </Button>
        </div>
      </div>

      {showAuditLogs && <AuditLogger />}

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
                  checked={securitySettings.ssoEnabled}
                  onCheckedChange={(checked) => updateSecuritySetting('ssoEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mfa">Multi-Factor Authentication</Label>
                <Switch 
                  id="mfa"
                  checked={securitySettings.mfaRequired}
                  onCheckedChange={(checked) => updateSecuritySetting('mfaRequired', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ipRestriction">IP Restriction</Label>
                <Switch 
                  id="ipRestriction"
                  checked={securitySettings.ipRestriction}
                  onCheckedChange={(checked) => updateSecuritySetting('ipRestriction', checked)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="passwordExpiry">Password Expiry (Days)</Label>
                <Input 
                  id="passwordExpiry"
                  type="number"
                  value={securitySettings.passwordExpiry}
                  onChange={(e) => updateSecuritySetting('passwordExpiry', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                <Input 
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
          <Button 
            onClick={saveSecuritySettings}
            disabled={!hasUnsavedChanges}
            className="w-full md:w-auto"
          >
            {hasUnsavedChanges ? 'Save Security Settings' : 'Settings Saved'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>
                    <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Permissions</Button>
                      <Button size="sm" variant="outline">Disable</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
