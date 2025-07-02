
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building, Send, Users, Star } from "lucide-react";

interface InsurerMatchingEnhancedProps {
  rfqData: any;
  onMatchingComplete: (matches: any[]) => void;
  onBack: () => void;
}

// Mock insurer data - this should come from database
const AVAILABLE_INSURERS = [
  {
    id: '1',
    name: 'AIICO Insurance PLC',
    email: 'underwriting@aiicoplc.com',
    specialties: ['Motor', 'Fire', 'Marine', 'Aviation'],
    rating: 4.5,
    response_time: '2-3 days',
    commission_rate: 12.5,
    selected: false
  },
  {
    id: '2',
    name: 'Leadway Assurance',
    email: 'quotes@leadway.com',
    specialties: ['General Accident', 'Professional Indemnity', 'Motor'],
    rating: 4.3,
    response_time: '1-2 days',
    commission_rate: 15.0,
    selected: false
  },
  {
    id: '3',
    name: 'AXA Mansard Insurance',
    email: 'underwriting@axamansard.com',
    specialties: ['Motor', 'Fire', 'Engineering', 'Cyber'],
    rating: 4.6,
    response_time: '2-4 days',
    commission_rate: 13.0,
    selected: false
  },
  {
    id: '4',
    name: 'Cornerstone Insurance',
    email: 'quotes@cornerstone.com.ng',
    specialties: ['Fire', 'Engineering', 'Public Liability'],
    rating: 4.2,
    response_time: '3-5 days',
    commission_rate: 12.0,
    selected: false
  },
  {
    id: '5',
    name: 'Sovereign Trust Insurance',
    email: 'underwriting@sovereign.ng',
    specialties: ['Directors & Officers', 'Professional Indemnity', 'Cyber'],
    rating: 4.4,
    response_time: '2-3 days',
    commission_rate: 14.0,
    selected: false
  }
];

export const InsurerMatchingEnhanced = ({ rfqData, onMatchingComplete, onBack }: InsurerMatchingEnhancedProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [insurers, setInsurers] = useState(AVAILABLE_INSURERS);
  const [commissionSplits, setCommissionSplits] = useState<{[key: string]: number}>({});

  // Calculate total commission split
  const totalSplit = Object.values(commissionSplits).reduce((sum, split) => sum + split, 0);
  const selectedInsurers = insurers.filter(insurer => insurer.selected);

  useEffect(() => {
    // Auto-distribute commission equally among selected insurers
    const selected = insurers.filter(insurer => insurer.selected);
    if (selected.length > 0) {
      const equalSplit = 100 / selected.length;
      const newSplits: {[key: string]: number} = {};
      selected.forEach(insurer => {
        newSplits[insurer.id] = Math.round(equalSplit * 100) / 100;
      });
      setCommissionSplits(newSplits);
    }
  }, [insurers]);

  const handleInsurerToggle = (insurerId: string, checked: boolean) => {
    setInsurers(prev => prev.map(insurer => 
      insurer.id === insurerId ? { ...insurer, selected: checked } : insurer
    ));
  };

  const handleCommissionSplitChange = (insurerId: string, split: number) => {
    setCommissionSplits(prev => ({
      ...prev,
      [insurerId]: split
    }));
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

    if (Math.abs(totalSplit - 100) > 0.01) {
      toast({
        title: "Error",
        description: "Commission splits must total 100%",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate dispatching RFQ to selected insurers
      const matches = selectedInsurers.map(insurer => ({
        insurer_id: insurer.id,
        insurer_name: insurer.name,
        insurer_email: insurer.email,
        commission_split: commissionSplits[insurer.id] || 0,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Insurer Matching & RFQ Dispatch
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select insurers and set commission splits for RFQ dispatch
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              <Users className="h-4 w-4 mr-2" />
              {insurers.every(insurer => insurer.selected) ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-gray-600">
              {selectedInsurers.length} of {insurers.length} insurers selected
            </span>
          </div>
          
          <div className="text-sm">
            <span className={`font-medium ${Math.abs(totalSplit - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              Total Split: {totalSplit.toFixed(1)}%
            </span>
          </div>
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
                        <p className="text-smtp text-gray-600">{insurer.email}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{insurer.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {insurer.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Response Time: {insurer.response_time}</span>
                      <span>Standard Commission: {insurer.commission_rate}%</span>
                    </div>
                    
                    {insurer.selected && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Label htmlFor={`split-${insurer.id}`} className="text-sm">
                          Commission Split (%):
                        </Label>
                        <Input
                          id={`split-${insurer.id}`}
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={commissionSplits[insurer.id] || 0}
                          onChange={(e) => handleCommissionSplitChange(insurer.id, parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Commission Split Summary */}
        {selectedInsurers.length > 0 && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Commission Split Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedInsurers.map((insurer) => (
                <div key={insurer.id} className="flex justify-between text-sm">
                  <span>{insurer.name}</span>
                  <span className="font-medium">{commissionSplits[insurer.id] || 0}%</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span className={Math.abs(totalSplit - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}>
                  {totalSplit.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
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
