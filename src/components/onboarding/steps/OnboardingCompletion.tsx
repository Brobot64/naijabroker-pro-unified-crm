
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Download, Users, Settings, Palette } from "lucide-react";

interface OnboardingData {
  organization: {
    name: string;
    plan: string;
    industry: string;
    size: string;
  };
  adminUser: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
  };
  systemConfig: {
    currency: string;
    timezone: string;
    businessHours: string;
    security: {
      mfaRequired: boolean;
      passwordPolicy: string;
    };
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    companyInfo: {
      address: string;
      phone: string;
      email: string;
    };
  };
  team: Array<{
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  }>;
}

interface OnboardingCompletionProps {
  data: OnboardingData;
  onComplete: () => void;
}

export const OnboardingCompletion = ({ data, onComplete }: OnboardingCompletionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleComplete = async () => {
    setIsProcessing(true);
    
    // Simulate setup processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onComplete();
  };

  const completedSteps = [
    {
      icon: Check,
      title: 'Organization Setup',
      description: `${data.organization.name} - ${data.organization.plan} Plan`,
      completed: true
    },
    {
      icon: Users,
      title: 'Admin Configuration',
      description: `${data.adminUser.firstName} ${data.adminUser.lastName} - ${data.adminUser.role}`,
      completed: true
    },
    {
      icon: Settings,
      title: 'System Configuration',
      description: `${data.systemConfig.currency} • ${data.systemConfig.timezone}`,
      completed: true
    },
    {
      icon: Palette,
      title: 'Branding Setup',
      description: data.branding.companyInfo.address ? 'Custom branding configured' : 'Default branding applied',
      completed: true
    },
    {
      icon: Users,
      title: 'Team Setup',
      description: data.team.length > 0 ? `${data.team.length} team members invited` : 'Team setup skipped',
      completed: true
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-900">Setup Complete!</CardTitle>
          <p className="text-gray-600">
            Your NaijaBroker Pro platform has been successfully configured and is ready to use.
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                <Check className="w-5 h-5 text-green-600" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Access Your Dashboard</h4>
              <p className="text-sm text-gray-600 mb-3">
                Start managing your insurance brokerage operations immediately.
              </p>
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Download Resources</h4>
              <p className="text-sm text-gray-600 mb-3">
                Get quick start guides and best practices documentation.
              </p>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Guide
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-4">Recommended Actions:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h5 className="font-medium mb-2">Immediate Tasks:</h5>
                <ul className="space-y-1">
                  <li>• Complete your user profile</li>
                  <li>• Import existing client data</li>
                  <li>• Set up email notifications</li>
                  <li>• Configure integrations</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Within 7 Days:</h5>
                <ul className="space-y-1">
                  <li>• Train your team on the platform</li>
                  <li>• Create your first quotes</li>
                  <li>• Set up automated workflows</li>
                  <li>• Schedule a success review</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          onClick={handleComplete}
          disabled={isProcessing}
          size="lg"
          className="px-8"
        >
          {isProcessing ? 'Setting up your platform...' : 'Complete Setup & Access Dashboard'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
