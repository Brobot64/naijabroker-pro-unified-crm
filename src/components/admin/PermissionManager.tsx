
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserPermissions {
  userId: string;
  permissions: string[];
}

interface PermissionManagerProps {
  user: User;
  onClose: () => void;
  onSave: (userPermissions: UserPermissions) => void;
}

export const PermissionManager = ({ user, onClose, onSave }: PermissionManagerProps) => {
  const { toast } = useToast();
  
  const [permissions] = useState<Permission[]>([
    { id: 'dashboard.view', name: 'View Dashboard', description: 'Access to main dashboard', category: 'Dashboard' },
    { id: 'leads.view', name: 'View Leads', description: 'View lead information', category: 'CRM' },
    { id: 'leads.create', name: 'Create Leads', description: 'Create new leads', category: 'CRM' },
    { id: 'leads.edit', name: 'Edit Leads', description: 'Modify existing leads', category: 'CRM' },
    { id: 'quotes.view', name: 'View Quotes', description: 'View quote information', category: 'Quotes' },
    { id: 'quotes.create', name: 'Create Quotes', description: 'Generate new quotes', category: 'Quotes' },
    { id: 'quotes.approve', name: 'Approve Quotes', description: 'Approve quote requests', category: 'Quotes' },
    { id: 'policies.view', name: 'View Policies', description: 'View policy information', category: 'Policies' },
    { id: 'policies.create', name: 'Create Policies', description: 'Create new policies', category: 'Policies' },
    { id: 'policies.renew', name: 'Renew Policies', description: 'Process policy renewals', category: 'Policies' },
    { id: 'financial.view', name: 'View Financial', description: 'View financial reports', category: 'Financial' },
    { id: 'financial.process', name: 'Process Payments', description: 'Process payment transactions', category: 'Financial' },
    { id: 'claims.view', name: 'View Claims', description: 'View claims information', category: 'Claims' },
    { id: 'claims.process', name: 'Process Claims', description: 'Process claim requests', category: 'Claims' },
    { id: 'users.view', name: 'View Users', description: 'View user accounts', category: 'Administration' },
    { id: 'users.manage', name: 'Manage Users', description: 'Create and modify user accounts', category: 'Administration' },
    { id: 'system.config', name: 'System Configuration', description: 'Configure system settings', category: 'Administration' },
  ]);

  const [userPermissions, setUserPermissions] = useState<string[]>(() => {
    // Initialize with default permissions based on role
    const roleDefaults: Record<string, string[]> = {
      'BrokerAdmin': ['dashboard.view', 'leads.view', 'leads.create', 'leads.edit', 'quotes.view', 'quotes.create', 'quotes.approve', 'policies.view', 'policies.create', 'policies.renew', 'financial.view', 'financial.process', 'users.view', 'users.manage'],
      'Underwriter': ['dashboard.view', 'leads.view', 'quotes.view', 'quotes.create', 'quotes.approve', 'policies.view', 'policies.create', 'policies.renew', 'claims.view', 'claims.process'],
      'Agent': ['dashboard.view', 'leads.view', 'leads.create', 'leads.edit', 'quotes.view', 'quotes.create'],
      'Compliance': ['dashboard.view', 'policies.view', 'claims.view', 'financial.view'],
      'User': ['dashboard.view']
    };
    return roleDefaults[user.role] || [];
  });

  const togglePermission = (permissionId: string) => {
    setUserPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = () => {
    onSave({ userId: user.id, permissions: userPermissions });
    toast({
      title: "Permissions updated",
      description: `Successfully updated permissions for ${user.name}.`,
    });
    onClose();
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Permissions</CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-gray-600">User:</span>
              <span className="font-medium">{user.name}</span>
              <Badge variant="outline">{user.role}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-lg border-b pb-2">{category}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryPermissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor={permission.id} className="font-medium">
                      {permission.name}
                    </Label>
                    <p className="text-sm text-gray-600">{permission.description}</p>
                  </div>
                  <Switch
                    id={permission.id}
                    checked={userPermissions.includes(permission.id)}
                    onCheckedChange={() => togglePermission(permission.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Permissions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
