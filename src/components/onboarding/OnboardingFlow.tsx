
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight } from "lucide-react";
import { OrganizationSetup } from "./steps/OrganizationSetup";
import { AdminUserSetup } from "./steps/AdminUserSetup";
import { SystemConfiguration } from "./steps/SystemConfiguration";
import { BrandingSetup } from "./steps/BrandingSetup";
import { TeamSetup } from "./steps/TeamSetup";
import { OnboardingCompletion } from "./steps/OnboardingCompletion";

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

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
}

export const OnboardingFlow = ({ onComplete }: { onComplete: (data: OnboardingData) => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    organization: { name: '', plan: '', industry: '', size: '' },
    adminUser: { firstName: '', lastName: '', email: '', phone: '', role: 'OrganizationAdmin' },
    systemConfig: {
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      businessHours: '9:00-17:00',
      security: { mfaRequired: false, passwordPolicy: 'standard' }
    },
    branding: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      companyInfo: { address: '', phone: '', email: '' }
    },
    team: []
  });

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'organization',
      title: 'Organization Setup',
      description: 'Basic company information and plan selection',
      required: true,
      completed: false
    },
    {
      id: 'admin',
      title: 'Admin User Setup', 
      description: 'Configure admin profile and permissions',
      required: true,
      completed: false
    },
    {
      id: 'system',
      title: 'System Configuration',
      description: 'Currency, timezone, and security settings',
      required: true,
      completed: false
    },
    {
      id: 'branding',
      title: 'Branding Setup',
      description: 'Company colors, logo, and contact info',
      required: false,
      completed: false
    },
    {
      id: 'team',
      title: 'Team Setup',
      description: 'Invite team members with roles',
      required: false,
      completed: false
    },
    {
      id: 'completion',
      title: 'Completion',
      description: 'Final review and dashboard access',
      required: true,
      completed: false
    }
  ]);

  const updateOnboardingData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const markStepCompleted = (stepIndex: number) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed: true } : step
    ));
  };

  const nextStep = () => {
    markStepCompleted(currentStep);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const skipStep = () => {
    if (!steps[currentStep].required) {
      nextStep();
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const renderCurrentStep = () => {
    const stepId = steps[currentStep].id;
    
    switch (stepId) {
      case 'organization':
        return <OrganizationSetup data={onboardingData.organization} onUpdate={(data) => updateOnboardingData({ organization: data })} />;
      case 'admin':
        return <AdminUserSetup data={onboardingData.adminUser} onUpdate={(data) => updateOnboardingData({ adminUser: data })} />;
      case 'system':
        return <SystemConfiguration data={onboardingData.systemConfig} onUpdate={(data) => updateOnboardingData({ systemConfig: data })} />;
      case 'branding':
        return <BrandingSetup data={onboardingData.branding} onUpdate={(data) => updateOnboardingData({ branding: data })} />;
      case 'team':
        return <TeamSetup data={onboardingData.team} onUpdate={(data) => updateOnboardingData({ team: data })} />;
      case 'completion':
        return <OnboardingCompletion data={onboardingData} onComplete={() => onComplete(onboardingData)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">NaijaBroker Pro</h1>
          <p className="text-gray-600">Complete your setup to get started</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{completedSteps}/{steps.length}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {steps.map((step, index) => (
              <li key={step.id}>
                <button
                  onClick={() => goToStep(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentStep 
                      ? 'bg-blue-100 border-l-4 border-blue-500' 
                      : step.completed 
                        ? 'bg-green-50 hover:bg-green-100' 
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : index === currentStep 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.completed ? <Check className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${index === currentStep ? 'text-blue-900' : 'text-gray-900'}`}>
                          {step.title}
                        </h3>
                        {!step.required && (
                          <span className="text-xs text-gray-500 ml-2">Optional</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{steps[currentStep].title}</h2>
              <p className="text-gray-600">{steps[currentStep].description}</p>
            </div>

            {renderCurrentStep()}

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              <div className="flex space-x-3">
                {!steps[currentStep].required && currentStep < steps.length - 1 && (
                  <Button variant="ghost" onClick={skipStep}>
                    Skip for now
                  </Button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <Button onClick={nextStep}>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={() => onComplete(onboardingData)}>
                    Complete Setup
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
