import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SystemConfigData {
  currency: string;
  timezone: string;
  businessHours: string;
  security: {
    mfaRequired: boolean;
    passwordPolicy: string;
  };
}

interface SystemConfigurationProps {
  data: SystemConfigData;
  onUpdate: (data: SystemConfigData) => void;
}

export const SystemConfiguration = ({ data, onUpdate }: SystemConfigurationProps) => {
  const [formData, setFormData] = useState<SystemConfigData>(data);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData };
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'security') {
        updated.security = {
          ...updated.security,
          [child]: value
        };
      }
    } else {
      (updated as any)[field] = value;
    }
    setFormData(updated);
    onUpdate(updated);
  };

  const currencies = [
    { value: 'NGN', label: 'Nigerian Naira (₦)', symbol: '₦' },
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' }
  ];

  const timezones = [
    { value: 'Africa/Lagos', label: 'West Africa Time (Lagos)' },
    { value: 'Africa/Cairo', label: 'Egypt Time (Cairo)' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (London)' }
  ];

  const businessHoursOptions = [
    { value: '8:00-17:00', label: '8:00 AM - 5:00 PM' },
    { value: '9:00-17:00', label: '9:00 AM - 5:00 PM' },
    { value: '8:00-16:00', label: '8:00 AM - 4:00 PM' },
    { value: '9:00-18:00', label: '9:00 AM - 6:00 PM' }
  ];

  const passwordPolicies = [
    { value: 'basic', label: 'Basic', description: 'Minimum 8 characters' },
    { value: 'standard', label: 'Standard', description: 'Minimum 8 characters with uppercase, lowercase, and numbers' },
    { value: 'strict', label: 'Strict', description: 'Minimum 12 characters with symbols, expires every 90 days' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Regional Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Default Currency *</Label>
              <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone *</Label>
              <Select value={formData.timezone} onValueChange={(value) => handleChange('timezone', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="businessHours">Business Hours *</Label>
              <Select value={formData.businessHours} onValueChange={(value) => handleChange('businessHours', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select business hours" />
                </SelectTrigger>
                <SelectContent>
                  {businessHoursOptions.map((hours) => (
                    <SelectItem key={hours.value} value={hours.value}>
                      {hours.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mfaRequired">Multi-Factor Authentication</Label>
                <p className="text-sm text-gray-600">Require MFA for all users</p>
              </div>
              <Switch
                id="mfaRequired"
                checked={formData.security.mfaRequired}
                onCheckedChange={(checked) => handleChange('security.mfaRequired', checked)}
              />
            </div>

            <div>
              <Label htmlFor="passwordPolicy">Password Policy *</Label>
              <div className="mt-2 space-y-2">
                {passwordPolicies.map((policy) => (
                  <div
                    key={policy.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.security.passwordPolicy === policy.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleChange('security.passwordPolicy', policy.value)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="passwordPolicy"
                        value={policy.value}
                        checked={formData.security.passwordPolicy === policy.value}
                        onChange={() => handleChange('security.passwordPolicy', policy.value)}
                        className="mr-3"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{policy.label}</h4>
                        <p className="text-sm text-gray-600">{policy.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Configuration Summary:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <strong>Currency:</strong> {currencies.find(c => c.value === formData.currency)?.label}
              </div>
              <div>
                <strong>Timezone:</strong> {timezones.find(t => t.value === formData.timezone)?.label}
              </div>
              <div>
                <strong>Business Hours:</strong> {businessHoursOptions.find(h => h.value === formData.businessHours)?.label}
              </div>
              <div>
                <strong>MFA Required:</strong> {formData.security.mfaRequired ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
