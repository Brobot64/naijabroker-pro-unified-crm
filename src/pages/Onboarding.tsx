
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingFlow } from "../components/onboarding/OnboardingFlow";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService, OnboardingData } from "@/services/organizationService";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const { user, signOut } = useAuth();
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

      if (!organization) {
        throw new Error('Organization was not created');
      }

      toast({
        title: "Setup Complete!",
        description: "Your organization has been successfully configured.",
      });

      // Force a sign out and back in to refresh the auth context with new organization data
      console.log('Onboarding completed, refreshing auth state...');
      
      // Sign out and immediately redirect to auth with a flag to auto-sign back in
      await signOut();
      
      // Store the completion flag and redirect to auth
      localStorage.setItem('onboarding_just_completed', 'true');
      localStorage.setItem('redirect_after_signin', '/app');
      
      navigate('/auth');
      
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "There was an error setting up your organization. Please try again.",
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

  console.log('Onboarding page: Rendering OnboardingFlow');
  
  // Temporary simple test to see if this renders
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Organization Setup</h1>
        <p className="text-gray-600 mb-8">Let's get your organization set up.</p>
        <div className="bg-white rounded-lg shadow p-6">
          <p>Test content - if you can see this, the page is working</p>
        </div>
      </div>
    </div>
  );
  
  // Original component (commented out temporarily)
  // return <OnboardingFlow onComplete={handleOnboardingComplete} />;
};

export default Onboarding;
