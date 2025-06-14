
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Mail } from "lucide-react";

interface TeamMember {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface TeamSetupProps {
  data: TeamMember[];
  onUpdate: (data: TeamMember[]) => void;
}

export const TeamSetup = ({ data, onUpdate }: TeamSetupProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(data);
  const [newMember, setNewMember] = useState<TeamMember>({
    email: '',
    role: 'Agent',
    firstName: '',
    lastName: ''
  });

  const roles = [
    { value: 'BrokerAdmin', label: 'Broker Admin', description: 'Broker operations and team management' },
    { value: 'Underwriter', label: 'Underwriter', description: 'Risk evaluation and policy issuance' },
    { value: 'Agent', label: 'Agent', description: 'Lead generation and client management' },
    { value: 'Compliance', label: 'Compliance Officer', description: 'Regulatory compliance and audit' },
    { value: 'User', label: 'User', description: 'Basic analytics and reporting access' }
  ];

  const addTeamMember = () => {
    if (newMember.email && newMember.firstName && newMember.lastName) {
      const updated = [...teamMembers, { ...newMember }];
      setTeamMembers(updated);
      onUpdate(updated);
      setNewMember({ email: '', role: 'Agent', firstName: '', lastName: '' });
    }
  };

  const removeTeamMember = (index: number) => {
    const updated = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(updated);
    onUpdate(updated);
  };

  const sendInvitations = () => {
    // This would typically send actual invitations
    console.log('Sending invitations to:', teamMembers);
    alert(`Invitations will be sent to ${teamMembers.length} team members`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Team Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={newMember.firstName}
                onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                placeholder="Enter first name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={newMember.lastName}
                onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                placeholder="Enter last name"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              placeholder="Enter email address"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-gray-600">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={addTeamMember} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </CardContent>
      </Card>

      {teamMembers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members ({teamMembers.length})</CardTitle>
              <Button onClick={sendInvitations} variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Send Invitations
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                    <div className="text-sm">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {roles.find(r => r.value === member.role)?.label}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTeamMember(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <div key={role.value} className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{role.label}</h4>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                
                <div className="text-xs text-gray-500">
                  {role.value === 'BrokerAdmin' && (
                    <ul className="space-y-1">
                      <li>• Full broker operations access</li>
                      <li>• Team management</li>
                      <li>• Financial reporting</li>
                      <li>• System configuration</li>
                    </ul>
                  )}
                  {role.value === 'Underwriter' && (
                    <ul className="space-y-1">
                      <li>• Risk assessment</li>
                      <li>• Policy issuance</li>
                      <li>• Claims processing</li>
                      <li>• Quote approvals</li>
                    </ul>
                  )}
                  {role.value === 'Agent' && (
                    <ul className="space-y-1">
                      <li>• Lead management</li>
                      <li>• Quote generation</li>
                      <li>• Client communications</li>
                      <li>• Basic reporting</li>
                    </ul>
                  )}
                  {role.value === 'Compliance' && (
                    <ul className="space-y-1">
                      <li>• Regulatory reporting</li>
                      <li>• Audit trails</li>
                      <li>• Policy compliance</li>
                      <li>• Risk monitoring</li>
                    </ul>
                  )}
                  {role.value === 'User' && (
                    <ul className="space-y-1">
                      <li>• View dashboards</li>
                      <li>• Basic analytics</li>
                      <li>• Report generation</li>
                      <li>• Limited access</li>
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Team Setup Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Team members will receive email invitations with setup instructions</li>
              <li>• You can modify roles and permissions anytime from the admin panel</li>
              <li>• New team members can be added later through the user management section</li>
              <li>• Consider starting with core team members and expanding gradually</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
