
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminUser } from "@/services/adminService";

interface AdminUserFormProps {
  onSubmit: (userData: Omit<AdminUser, 'id' | 'lastLogin' | 'status'>) => Promise<AdminUser>;
  onClose: () => void;
}

export const AdminUserForm = ({ onSubmit, onClose }: AdminUserFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'SupportEngineer',
    permissions: ['support', 'logs']
  });

  const roles = [
    { value: 'SuperAdmin', label: 'Super Administrator', permissions: ['all'] },
    { value: 'SystemAdmin', label: 'System Administrator', permissions: ['system', 'users', 'billing'] },
    { value: 'SupportEngineer', label: 'Support Engineer', permissions: ['support', 'logs'] }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedRole = roles.find(r => r.value === formData.role);
      await onSubmit({
        ...formData,
        permissions: selectedRole?.permissions || []
      });

      toast({
        title: "Admin User Created",
        description: `Successfully created admin user: ${formData.name}`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create admin user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Create Admin User</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="role">Administrative Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Admin User
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
