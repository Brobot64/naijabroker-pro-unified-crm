
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingFlow } from "../components/onboarding/OnboardingFlow";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService, OnboardingData } from "@/services/organizationService";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to complete onboarding.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const { organization, error } = await organizationService.createOrganizationFromOnboarding(data, user.id);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Setup Complete!",
        description: "Your organization has been successfully configured.",
      });

      // Store completion status
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('user_role', data.adminUser.role);
      localStorage.setItem('organization_data', JSON.stringify(data));
      
      // Redirect to dashboard
      navigate('/app');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Setup Failed",
        description: "There was an error setting up your organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up your organization...</p>
        </div>
      </div>
    );
  }

  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
};

export default Onboarding;
