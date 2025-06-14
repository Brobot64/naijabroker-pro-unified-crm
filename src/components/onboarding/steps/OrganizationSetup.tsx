
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

interface OrganizationData {
  name: string;
  plan: string;
  industry: string;
  size: string;
}

interface OrganizationSetupProps {
  data: OrganizationData;
  onUpdate: (data: OrganizationData) => void;
}

export const OrganizationSetup = ({ data, onUpdate }: OrganizationSetupProps) => {
  const [formData, setFormData] = useState<OrganizationData>(data);

  const handleChange = (field: keyof OrganizationData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  const plans = [
    { value: 'starter', label: 'Starter Plan - ₦50,000/month', description: 'Perfect for small brokerages' },
    { value: 'professional', label: 'Professional Plan - ₦150,000/month', description: 'For growing insurance businesses' },
    { value: 'enterprise', label: 'Enterprise Plan - ₦300,000/month', description: 'Full-featured for large operations' }
  ];

  const industries = [
    'General Insurance',
    'Life Insurance', 
    'Health Insurance',
    'Motor Insurance',
    'Marine Insurance',
    'Aviation Insurance',
    'Oil & Gas Insurance'
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '500+ employees'
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your company name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="industry">Primary Industry *</Label>
              <Select value={formData.industry} onValueChange={(value) => handleChange('industry', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your primary industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="companySize">Company Size *</Label>
              <Select value={formData.size} onValueChange={(value) => handleChange('size', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Choose Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.plan === plan.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChange('plan', plan.value)}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="plan"
                      value={plan.value}
                      checked={formData.plan === plan.value}
                      onChange={() => handleChange('plan', plan.value)}
                      className="mr-3"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{plan.label}</h4>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>14-day free trial</strong> included with all plans. No credit card required.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">What's Included:</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Complete CRM and lead management</li>
              <li>• Quote generation and comparison tools</li>
              <li>• Policy management and renewals</li>
              <li>• Claims processing and tracking</li>
              <li>• Financial reporting and compliance</li>
              <li>• 24/7 customer support</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
