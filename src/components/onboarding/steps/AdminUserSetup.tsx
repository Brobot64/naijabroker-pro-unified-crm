
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

interface AdminUserSetupProps {
  data: AdminUserData;
  onUpdate: (data: AdminUserData) => void;
}

export const AdminUserSetup = ({ data, onUpdate }: AdminUserSetupProps) => {
  const [formData, setFormData] = useState<AdminUserData>(data);

  const handleChange = (field: keyof AdminUserData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  const roles = [
    {
      value: 'SuperAdmin',
      label: 'Super Admin',
      description: 'Full platform access including system configuration'
    },
    {
      value: 'OrganizationAdmin',
      label: 'Organization Admin',
      description: 'Complete organization management capabilities'
    },
    {
      value: 'BrokerAdmin',
      label: 'Broker Admin',
      description: 'Broker operations and team management'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Administrator Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter first name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter last name"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="admin@yourcompany.com"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              This will be your login email and primary contact
            </p>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+234 xxx xxx xxxx"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.role === role.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleChange('role', role.value)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={() => handleChange('role', role.value)}
                    className="mr-3"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{role.label}</h4>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2">Important:</h4>
            <p className="text-sm text-amber-800">
              The administrator role determines your access level and permissions. 
              You can modify user roles later, but ensure you maintain at least one 
              Organization Admin for your company.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You'll receive a welcome email with login instructions</li>
              <li>• Set up multi-factor authentication for enhanced security</li>
              <li>• Complete your profile information in the dashboard</li>
              <li>• Configure password policies for your organization</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
