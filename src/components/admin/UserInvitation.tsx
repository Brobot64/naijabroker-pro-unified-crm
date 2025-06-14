
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteUser {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface UserInvitationProps {
  onInvite: (users: InviteUser[]) => void;
  onClose: () => void;
}

export const UserInvitation = ({ onInvite, onClose }: UserInvitationProps) => {
  const { toast } = useToast();
  const [inviteUsers, setInviteUsers] = useState<InviteUser[]>([]);
  const [currentUser, setCurrentUser] = useState<InviteUser>({
    email: '',
    role: 'Agent',
    firstName: '',
    lastName: ''
  });

  const roles = [
    { value: 'BrokerAdmin', label: 'Broker Admin' },
    { value: 'Underwriter', label: 'Underwriter' },
    { value: 'Agent', label: 'Agent' },
    { value: 'Compliance', label: 'Compliance Officer' },
    { value: 'User', label: 'User' }
  ];

  const addUser = () => {
    if (currentUser.email && currentUser.firstName && currentUser.lastName) {
      setInviteUsers([...inviteUsers, currentUser]);
      setCurrentUser({ email: '', role: 'Agent', firstName: '', lastName: '' });
    }
  };

  const removeUser = (index: number) => {
    setInviteUsers(inviteUsers.filter((_, i) => i !== index));
  };

  const sendInvitations = () => {
    if (inviteUsers.length === 0) {
      toast({
        title: "No users to invite",
        description: "Please add at least one user to invite.",
        variant: "destructive",
      });
      return;
    }

    // Simulate sending invitations
    console.log('Sending invitations to:', inviteUsers);
    onInvite(inviteUsers);
    
    toast({
      title: "Invitations sent",
      description: `Successfully sent ${inviteUsers.length} invitation(s).`,
    });
    
    onClose();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Invite New Users</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={currentUser.firstName}
              onChange={(e) => setCurrentUser({ ...currentUser, firstName: e.target.value })}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={currentUser.lastName}
              onChange={(e) => setCurrentUser({ ...currentUser, lastName: e.target.value })}
              placeholder="Enter last name"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={currentUser.email}
            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
            placeholder="Enter email address"
          />
        </div>
        
        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={currentUser.role} onValueChange={(value) => setCurrentUser({ ...currentUser, role: value })}>
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
        
        <Button onClick={addUser} className="w-full">
          Add User to Invitation List
        </Button>
        
        {inviteUsers.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Users to Invite ({inviteUsers.length})</h4>
            {inviteUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <Badge variant="outline">{roles.find(r => r.value === user.role)?.label}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeUser(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex space-x-2">
              <Button onClick={sendInvitations} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Send Invitations
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
