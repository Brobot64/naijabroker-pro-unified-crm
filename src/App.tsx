
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingStatus = localStorage.getItem('onboarding_completed');
    setIsOnboardingComplete(onboardingStatus === 'true');
  }, []);

  // Show loading while checking onboarding status
  if (isOnboardingComplete === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading NaijaBroker Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* If onboarding is not complete, show onboarding flow */}
            {!isOnboardingComplete ? (
              <>
                <Route path="/" element={<Onboarding />} />
                <Route path="*" element={<Onboarding />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Index />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
