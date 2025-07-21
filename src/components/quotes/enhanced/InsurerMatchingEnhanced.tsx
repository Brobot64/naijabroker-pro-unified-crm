import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building, Send, Users, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InsurerMatchingEnhancedProps {
  rfqData: any;
  onMatchingComplete: (matches: any[]) => void;
  onBack: () => void;
}

interface Insurer {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  rating: number;
  is_active: boolean;
  selected?: boolean;
}

export const InsurerMatchingEnhanced = ({ rfqData, onMatchingComplete, onBack }: InsurerMatchingEnhancedProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingInsurers, setLoadingInsurers] = useState(true);
  const [insurers, setInsurers] = useState<Insurer[]>([]);

  const selectedInsurers = insurers.filter(insurer => insurer.selected);

  useEffect(() => {
    fetchInsurers();
  }, []);

  const fetchInsurers = async () => {
    setLoadingInsurers(true);
    try {
      const { data, error } = await supabase
        .from('insurers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      setInsurers((data || []).map(insurer => ({ ...insurer, selected: false })));
    } catch (error) {
      console.error('Error fetching insurers:', error);
      toast({
        title: "Error",
        description: "Failed to load insurers",
        variant: "destructive"
      });
    } finally {
      setLoadingInsurers(false);
    }
  };

  const handleInsurerToggle = (insurerId: string, checked: boolean) => {
    setInsurers(prev => prev.map(insurer => 
      insurer.id === insurerId ? { ...insurer, selected: checked } : insurer
    ));
  };

  const handleSelectAll = () => {
    const allSelected = insurers.every(insurer => insurer.selected);
    setInsurers(prev => prev.map(insurer => ({ ...insurer, selected: !allSelected })));
  };

  const handleDispatchRFQ = async () => {
    if (selectedInsurers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one insurer",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user's profile for broker email
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('Organization not found');
      }

      // Get organization details for broker email
      const { data: organization } = await supabase
        .from('organizations')
        .select('email, name')
        .eq('id', profile.organization_id)
        .single();

      const brokerEmail = organization?.email || 'broker@naijabrokerpro.com';

       // Send RFQ emails to all selected insurers
      for (const insurer of selectedInsurers) {
        try {
          // Debug: Log the rfqData to see what's being passed
          console.log('DEBUG: rfqData in InsurerMatching:', rfqData);
          console.log('DEBUG: rfqData.content:', rfqData?.content);
          
          // Use the pre-generated RFQ content with proper header
          const rfqContent = `Dear ${insurer.name},

We are pleased to invite you to provide a quotation for the following insurance requirement:

${rfqData?.content || 'RFQ details not available'}

Please provide your competitive quotation within 48 hours. Include your premium rates, terms and conditions, and any exclusions.

Respond to this email with your quote documents attached.

Best regards,
${organization?.name || 'NaijaBroker Pro'}
Insurance Brokers`;

          await supabase.functions.invoke('send-email-notification', {
            body: {
              type: 'rfq_dispatch',
              recipientEmail: insurer.email,
              subject: `RFQ ${rfqData?.quote_number || ''} - Request for Quotation - ${rfqData?.client_name || 'Insurance RFQ'}`,
              message: rfqContent,
              metadata: {
                insurer_id: insurer.id,
                insurer_name: insurer.name,
                rfq_data: rfqData,
                broker_copy: true
              }
            }
          });

          // Send copy to broker
          await supabase.functions.invoke('send-email-notification', {
            body: {
              type: 'rfq_dispatch_copy',
              recipientEmail: brokerEmail,
              subject: `RFQ ${rfqData?.quote_number || ''} Sent to ${insurer.name} - ${rfqData?.client_name || 'Insurance RFQ'}`,
              message: `RFQ has been successfully sent to ${insurer.name} (${insurer.email}).\n\nRFQ Content:\n${rfqContent}`,
              metadata: {
                insurer_id: insurer.id,
                insurer_name: insurer.name,
                copy_type: 'broker_notification'
              }
            }
          });

        } catch (emailError) {
          console.error(`Failed to send RFQ to ${insurer.name}:`, emailError);
          // Continue with other insurers even if one fails
        }
      }

      // Update quote status and workflow stage
      if (rfqData?.quote_id) {
        try {
          const { WorkflowStatusService } = await import('@/services/workflowStatusService');
          await WorkflowStatusService.updateQuoteWorkflowStage(rfqData.quote_id, {
            stage: 'insurer-matching',
            status: 'sent'
          });
        } catch (updateError) {
          console.error('Failed to update quote workflow stage:', updateError);
        }
      }

      // Create matches for tracking
      const matches = selectedInsurers.map(insurer => ({
        insurer_id: insurer.id,
        insurer_name: insurer.name,
        insurer_email: insurer.email,
        dispatched_at: new Date().toISOString(),
        status: 'dispatched',
        rfq_content: rfqData?.content,
        quote_id: rfqData?.quote_id,
      }));

      toast({
        title: "RFQ Dispatched Successfully",
        description: `RFQ sent to ${selectedInsurers.length} insurers with copies to broker email`,
      });

      onMatchingComplete(matches);
    } catch (error) {
      console.error('Error dispatching RFQ:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to dispatch RFQ",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingInsurers) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading insurers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Insurer Matching & RFQ Dispatch
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select insurers for RFQ dispatch
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection Controls */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            <Users className="h-4 w-4 mr-2" />
            {insurers.every(insurer => insurer.selected) ? 'Deselect All' : 'Select All'}
          </Button>
          <span className="text-sm text-gray-600">
            {selectedInsurers.length} of {insurers.length} insurers selected
          </span>
        </div>

        {/* Insurers List */}
        <div className="space-y-4">
          {insurers.map((insurer) => (
            <Card key={insurer.id} className={`border ${insurer.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={insurer.selected}
                    onCheckedChange={(checked) => handleInsurerToggle(insurer.id, !!checked)}
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{insurer.name}</h4>
                        <p className="text-sm text-gray-600">{insurer.email}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{insurer.rating}</span>
                      </div>
                    </div>
                    
                    {insurer.specialties && insurer.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {insurer.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {insurers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No active insurers found. Please add insurers in the admin section.
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleDispatchRFQ} disabled={loading || selectedInsurers.length === 0}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Dispatching..." : `Dispatch RFQ to ${selectedInsurers.length} Insurers`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};