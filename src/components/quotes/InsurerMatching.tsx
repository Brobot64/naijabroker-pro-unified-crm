
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Building, Send, Star } from "lucide-react";

interface InsurerMatchingProps {
  rfqData: any;
  onMatchingComplete: (matches: any[]) => void;
  onBack: () => void;
}

export const InsurerMatching = ({ rfqData, onMatchingComplete, onBack }: InsurerMatchingProps) => {
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>([]);
  const [isDispatching, setIsDispatching] = useState(false);

  // Mock insurer data with ratings and past performance
  const availableInsurers = [
    {
      id: "axa_mansard",
      name: "AXA Mansard Insurance",
      rating: 4.8,
      responseTime: "24 hours",
      acceptanceRate: 85,
      lastQuoteDate: "2024-06-15",
      specialties: ["Corporate", "Industrial"],
      recommended: true
    },
    {
      id: "aiico",
      name: "AIICO Insurance Plc",
      rating: 4.6,
      responseTime: "48 hours",
      acceptanceRate: 78,
      lastQuoteDate: "2024-06-20",
      specialties: ["Marine", "Aviation"],
      recommended: true
    },
    {
      id: "cornerstone",
      name: "Cornerstone Insurance",
      rating: 4.3,
      responseTime: "72 hours",
      acceptanceRate: 72,
      lastQuoteDate: "2024-05-30",
      specialties: ["Motor", "Fire"],
      recommended: false
    },
    {
      id: "leadway",
      name: "Leadway Assurance",
      rating: 4.5,
      responseTime: "36 hours",
      acceptanceRate: 80,
      lastQuoteDate: "2024-06-10",
      specialties: ["Life", "General"],
      recommended: true
    }
  ];

  const toggleInsurer = (insurerId: string) => {
    setSelectedInsurers(prev => 
      prev.includes(insurerId) 
        ? prev.filter(id => id !== insurerId)
        : [...prev, insurerId]
    );
  };

  const handleDispatchRFQ = async () => {
    if (selectedInsurers.length === 0) {
      return;
    }

    setIsDispatching(true);
    
    // Simulate dispatching RFQ
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const matches = selectedInsurers.map(insurerId => {
      const insurer = availableInsurers.find(i => i.id === insurerId);
      return {
        ...insurer,
        rfqSentAt: new Date().toISOString(),
        status: 'sent',
        trackingId: `TRK-${Date.now()}-${insurerId}`
      };
    });

    setIsDispatching(false);
    onMatchingComplete(matches);
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Insurer Matching & Dispatch</h2>
        </div>
        <Button 
          onClick={handleDispatchRFQ} 
          disabled={selectedInsurers.length === 0 || isDispatching}
        >
          <Send className="h-4 w-4 mr-2" />
          {isDispatching ? "Dispatching..." : `Dispatch to ${selectedInsurers.length} Insurers`}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Insurers</CardTitle>
          <p className="text-sm text-gray-600">
            Select insurers to receive your RFQ. Recommended insurers are pre-selected based on your quote details.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableInsurers.map((insurer) => (
              <div 
                key={insurer.id} 
                className={`p-4 border rounded-lg ${
                  selectedInsurers.includes(insurer.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedInsurers.includes(insurer.id)}
                      onCheckedChange={() => toggleInsurer(insurer.id)}
                    />
                    <Building className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{insurer.name}</h4>
                        {insurer.recommended && (
                          <Badge variant="secondary">Recommended</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        {renderStarRating(insurer.rating)}
                        <span className="text-sm text-gray-600">
                          Response: {insurer.responseTime}
                        </span>
                        <span className="text-sm text-gray-600">
                          Acceptance: {insurer.acceptanceRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 ml-11">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Specialties: {insurer.specialties.join(", ")}</span>
                    <span>Last Quote: {insurer.lastQuoteDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dispatch Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedInsurers.length === 0 ? (
            <p className="text-gray-500">No insurers selected</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                RFQ will be sent to {selectedInsurers.length} insurer{selectedInsurers.length > 1 ? 's' : ''}:
              </p>
              <div className="space-y-1">
                {selectedInsurers.map(insurerId => {
                  const insurer = availableInsurers.find(i => i.id === insurerId);
                  return insurer ? (
                    <div key={insurerId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{insurer.name}</span>
                      <span className="text-sm text-gray-600">
                        Expected response: {insurer.responseTime}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
