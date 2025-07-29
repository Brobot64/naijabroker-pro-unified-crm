import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClaimsKPIDashboard } from "./ClaimsKPIDashboard";
import { ClaimsManagement } from "./ClaimsManagement";
import { ClaimRegistrationModal } from "./ClaimRegistrationModal";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, List, TrendingUp } from "lucide-react";

export const EnhancedClaimsManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const handleRegisterClaim = () => {
    setShowRegistrationModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Claims Management</h1>
          <p className="text-gray-600 mt-1">Monitor, manage, and analyze insurance claims</p>
        </div>
        <Button onClick={handleRegisterClaim} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Register New Claim
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview & KPIs
          </TabsTrigger>
          <TabsTrigger value="claims" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            All Claims
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ClaimsKPIDashboard />
        </TabsContent>

        <TabsContent value="claims" className="space-y-6">
          <ClaimsManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="p-8 border border-dashed border-gray-300 rounded-lg text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-gray-600 mb-4">
              Detailed claims analytics and reporting will be available here.
            </p>
            <p className="text-sm text-gray-500">
              Phase 6: Analytics & Reporting implementation
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <ClaimRegistrationModal 
        open={showRegistrationModal}
        onOpenChange={setShowRegistrationModal}
        onClaimCreated={() => {
          // This will trigger a refresh in the ClaimsManagement component
          window.dispatchEvent(new CustomEvent('claimCreated'));
        }}
      />
    </div>
  );
};