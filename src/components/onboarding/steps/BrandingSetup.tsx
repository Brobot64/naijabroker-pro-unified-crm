
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Palette } from "lucide-react";

interface BrandingData {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  companyInfo: {
    address: string;
    phone: string;
    email: string;
  };
}

interface BrandingSetupProps {
  data: BrandingData;
  onUpdate: (data: BrandingData) => void;
}

export const BrandingSetup = ({ data, onUpdate }: BrandingSetupProps) => {
  const [formData, setFormData] = useState<BrandingData>(data);

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData };
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated.companyInfo = { ...updated.companyInfo, [child]: value };
    } else {
      updated[field as keyof BrandingData] = value;
    }
    setFormData(updated);
    onUpdate(updated);
  };

  const colorPresets = [
    { name: 'Professional Blue', primary: '#2563eb', secondary: '#64748b' },
    { name: 'Corporate Green', primary: '#059669', secondary: '#6b7280' },
    { name: 'Trust Orange', primary: '#ea580c', secondary: '#71717a' },
    { name: 'Modern Purple', primary: '#7c3aed', secondary: '#6b7280' },
    { name: 'Classic Navy', primary: '#1e40af', secondary: '#64748b' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center space-x-3 mt-1">
                <input
                  type="color"
                  id="primaryColor"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder="#2563eb"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center space-x-3 mt-1">
                <input
                  type="color"
                  id="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  placeholder="#64748b"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Color Presets</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      handleChange('primaryColor', preset.primary);
                      handleChange('secondaryColor', preset.secondary);
                    }}
                    className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50 text-left"
                  >
                    <div className="flex space-x-1">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {formData.logo ? (
                <div>
                  <img src={formData.logo} alt="Company Logo" className="max-h-24 mx-auto mb-4" />
                  <Button variant="outline" size="sm">
                    Change Logo
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload your company logo</p>
                  <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 2MB</p>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Recommended dimensions: 200x80px</p>
              <p>Your logo will appear in the header and on documents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              value={formData.companyInfo.address}
              onChange={(e) => handleChange('companyInfo.address', e.target.value)}
              placeholder="Enter your business address"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyPhone">Business Phone</Label>
              <Input
                id="companyPhone"
                type="tel"
                value={formData.companyInfo.phone}
                onChange={(e) => handleChange('companyInfo.phone', e.target.value)}
                placeholder="+234 xxx xxx xxxx"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="companyEmail">Business Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={formData.companyInfo.email}
                onChange={(e) => handleChange('companyInfo.email', e.target.value)}
                placeholder="info@yourcompany.com"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="p-6 rounded-lg border"
            style={{
              background: `linear-gradient(135deg, ${formData.primaryColor}15, ${formData.secondaryColor}10)`
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: formData.primaryColor }}
              >
                NaijaBroker Pro
              </div>
              <div className="text-sm" style={{ color: formData.secondaryColor }}>
                Sample Document Header
              </div>
            </div>
            <div className="text-sm text-gray-600">
              This is how your branding will appear throughout the platform
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
