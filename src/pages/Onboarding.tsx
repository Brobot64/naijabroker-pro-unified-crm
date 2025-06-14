
import { useState } from "react";
import { OnboardingFlow } from "../components/onboarding/OnboardingFlow";

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

const Onboarding = () => {
  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log('Onboarding completed with data:', data);
    
    // Here you would typically:
    // 1. Save the onboarding data to your backend
    // 2. Create the organization and admin user
    // 3. Send team invitations
    // 4. Configure the system settings
    // 5. Redirect to the main dashboard
    
    // For now, we'll simulate this and redirect
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('user_role', data.adminUser.role);
    localStorage.setItem('organization_data', JSON.stringify(data));
    
    // Redirect to dashboard
    window.location.href = '/';
  };

  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
};

export default Onboarding;
