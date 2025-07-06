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
      // Dispatch RFQ to selected insurers
      const matches = selectedInsurers.map(insurer => ({
        insurer_id: insurer.id,
        insurer_name: insurer.name,
        insurer_email: insurer.email,
        dispatched_at: new Date().toISOString(),
        status: 'dispatched',
        rfq_content: rfqData?.content,
      }));

      toast({
        title: "Success",
        description: `RFQ dispatched to ${selectedInsurers.length} insurers`,
      });

      onMatchingComplete(matches);
    } catch (error) {
      console.error('Error dispatching RFQ:', error);
      toast({
        title: "Error",
        description: "Failed to dispatch RFQ",
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