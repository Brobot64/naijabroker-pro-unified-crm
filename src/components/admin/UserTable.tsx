
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string;
  status: string;
}

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onManagePermissions: (user: User) => void;
}

export const UserTable = ({ users, onEditUser, onManagePermissions }: UserTableProps) => {
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
                <Button size="sm" variant="outline" onClick={() => onEditUser(user)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => onManagePermissions(user)}>
                  Permissions
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
