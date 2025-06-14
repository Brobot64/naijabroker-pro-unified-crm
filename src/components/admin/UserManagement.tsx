import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { UserInvitation } from "./UserInvitation";
import { PermissionManager } from "./PermissionManager";
import { UserStats } from "./UserStats";
import { UserTable } from "./UserTable";
import { useToast } from "@/hooks/use-toast";
import { adminService } from "@/services/adminService";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string;
  status: string;
}

export const UserManagement = () => {
  const { toast } = useToast();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([
    {
      id: "USR-001",
      name: "John Smith",
      email: "john.smith@naijabroker.com",
      role: "BrokerAdmin",
      department: "Administration",
      lastLogin: "2024-06-11 09:30",
      status: "active"
    },
    {
      id: "USR-002", 
      name: "Mary Johnson",
      email: "mary.johnson@naijabroker.com",
      role: "Agent",
      department: "Sales",
      lastLogin: "2024-06-11 08:45",
      status: "active"
    },
    {
      id: "USR-003",
      name: "David Wilson",
      email: "david.wilson@naijabroker.com", 
      role: "Underwriter",
      department: "Underwriting",
      lastLogin: "2024-06-10 16:20",
      status: "active"
    },
    {
      id: "USR-004",
      name: "Sarah Brown",
      email: "sarah.brown@naijabroker.com",
      role: "Compliance",
      department: "Risk & Compliance", 
      lastLogin: "2024-06-09 14:15",
      status: "inactive"
    },
  ]);

  const handleInviteUsers = (invitedUsers: any[]) => {
    const newUsers = invitedUsers.map((user, index) => ({
      id: `USR-${String(users.length + index + 1).padStart(3, '0')}`,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      department: getDepartmentByRole(user.role),
      lastLogin: "Never",
      status: "pending"
    }));
    
    setUsers([...users, ...newUsers]);
    setShowInviteDialog(false);

    adminService.logAction(
      "USER_INVITED", 
      "User Management", 
      `Invited ${invitedUsers.length} new user(s)`,
      "medium"
    );
  };

  const handleEditUser = (user: User) => {
    toast({
      title: "Edit User",
      description: `Editing user: ${user.name}`,
    });
    
    adminService.logAction(
      "USER_EDIT_INITIATED", 
      "User Management", 
      `Started editing user: ${user.email}`,
      "low"
    );
  };

  const handleManagePermissions = (user: User) => {
    setSelectedUser(user);
    setShowPermissionDialog(true);
    
    adminService.logAction(
      "PERMISSIONS_VIEW", 
      "User Management", 
      `Viewing permissions for user: ${user.email}`,
      "low"
    );
  };

  const handleSavePermissions = (userPermissions: any) => {
    console.log('Saving permissions:', userPermissions);
    toast({
      title: "Permissions Updated",
      description: `Successfully updated permissions for ${selectedUser?.name}`,
    });
    
    adminService.logAction(
      "PERMISSIONS_UPDATED", 
      "User Management", 
      `Updated permissions for user: ${selectedUser?.email}`,
      "medium"
    );
    
    setShowPermissionDialog(false);
    setSelectedUser(null);
  };

  const getDepartmentByRole = (role: string) => {
    const roleDepartmentMap: Record<string, string> = {
      'BrokerAdmin': 'Administration',
      'Underwriter': 'Underwriting',
      'Agent': 'Sales',
      'Compliance': 'Risk & Compliance',
      'User': 'General'
    };
    return roleDepartmentMap[role] || 'General';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>Invite New User</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <UserInvitation onInvite={handleInviteUsers} onClose={() => setShowInviteDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <UserStats users={users} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Users</CardTitle>
            <div className="flex space-x-2">
              <Input placeholder="Search users..." className="w-64" />
              <Button variant="outline">Filter by Role</Button>
              <Button variant="outline">Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserTable 
            users={users} 
            onEditUser={handleEditUser}
            onManagePermissions={handleManagePermissions}
          />
        </CardContent>
      </Card>

      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-4xl">
          {selectedUser && (
            <PermissionManager
              user={selectedUser}
              onClose={() => setShowPermissionDialog(false)}
              onSave={handleSavePermissions}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
