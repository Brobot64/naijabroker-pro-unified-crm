import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserInvitation } from "./UserInvitation";
import { PermissionManager } from "./PermissionManager";
import { useToast } from "@/hooks/use-toast";

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
    // Add invited users to the users list
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
  };

  const handleEditUser = (user: User) => {
    toast({
      title: "Edit User",
      description: `Editing user: ${user.name}`,
    });
  };

  const handleManagePermissions = (user: User) => {
    setSelectedUser(user);
    setShowPermissionDialog(true);
  };

  const handleSavePermissions = (userPermissions: any) => {
    console.log('Saving permissions:', userPermissions);
    toast({
      title: "Permissions Updated",
      description: `Successfully updated permissions for ${selectedUser?.name}`,
    });
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SuperAdmin":
        return "bg-purple-100 text-purple-800";
      case "BrokerAdmin":
        return "bg-blue-100 text-blue-800";
      case "Underwriter":
        return "bg-green-100 text-green-800";
      case "Agent":
        return "bg-yellow-100 text-yellow-800";
      case "Compliance":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'Agent').length}</div>
            <p className="text-xs text-muted-foreground">Sales Agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'Underwriter').length}</div>
            <p className="text-xs text-muted-foreground">Underwriters</p>
          </CardContent>
        </Card>
      </div>

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleManagePermissions(user)}>
                        Permissions
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permission Management Dialog */}
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
