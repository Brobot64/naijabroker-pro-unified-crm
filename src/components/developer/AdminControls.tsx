
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const AdminControls = () => {
  const [adminUsers, setAdminUsers] = useState([
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

  const [securitySettings, setSecuritySettings] = useState({
    ssoEnabled: true,
    mfaRequired: true,
    passwordExpiry: 90,
    ipRestriction: true,
    sessionTimeout: 480
  });

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
        <Button>Add Admin User</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sso">Single Sign-On (SSO)</Label>
                <Switch 
                  id="sso"
                  checked={securitySettings.ssoEnabled}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, ssoEnabled: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mfa">Multi-Factor Authentication</Label>
                <Switch 
                  id="mfa"
                  checked={securitySettings.mfaRequired}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, mfaRequired: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ipRestriction">IP Restriction</Label>
                <Switch 
                  id="ipRestriction"
                  checked={securitySettings.ipRestriction}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, ipRestriction: checked})}
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
                  onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                <Input 
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>
          <Button>Update Security Settings</Button>
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
                    <Badge className="bg-green-100 text-green-800">{user.status}</Badge>
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
