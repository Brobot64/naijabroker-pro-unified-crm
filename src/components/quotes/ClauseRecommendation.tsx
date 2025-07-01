
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ArrowLeft } from "lucide-react";

interface Clause {
  id: string;
  name: string;
  description: string;
  category: 'extension' | 'exclusion' | 'warranty' | 'deductible';
  recommended: boolean;
  premium_impact?: number;
}

interface ClauseRecommendationProps {
  quoteData: any;
  onClausesSelected: (clauses: Clause[]) => void;
  onBack: () => void;
}

export const ClauseRecommendation = ({ quoteData, onClausesSelected, onBack }: ClauseRecommendationProps) => {
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);

  // Mock clauses based on insurance class
  const availableClauses: Clause[] = [
    {
      id: "flood_cover",
      name: "Flood Cover Extension",
      description: "Extends coverage to include flood damage",
      category: "extension",
      recommended: true,
      premium_impact: 5
    },
    {
      id: "terrorism_exclusion",
      name: "Terrorism Exclusion",
      description: "Excludes damages caused by terrorist activities",
      category: "exclusion",
      recommended: false,
      premium_impact: -2
    },
    {
      id: "security_warranty",
      name: "Security System Warranty",
      description: "Warranted that approved security systems are maintained",
      category: "warranty",
      recommended: true
    },
    {
      id: "deductible_10k",
      name: "₦10,000 Deductible",
      description: "First ₦10,000 of each claim to be borne by insured",
      category: "deductible",
      recommended: false,
      premium_impact: -8
    }
  ];

  const toggleClause = (clauseId: string) => {
    setSelectedClauses(prev => 
      prev.includes(clauseId) 
        ? prev.filter(id => id !== clauseId)
        : [...prev, clauseId]
    );
  };

  const handleContinue = () => {
    const selected = availableClauses.filter(clause => selectedClauses.includes(clause.id));
    onClausesSelected(selected);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'extension': return 'bg-blue-100 text-blue-800';
      case 'exclusion': return 'bg-red-100 text-red-800';
      case 'warranty': return 'bg-yellow-100 text-yellow-800';
      case 'deductible': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Clause & Add-On Recommendations</h2>
        </div>
        <Button onClick={handleContinue}>Continue to RFQ Generation</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommended Clauses for {quoteData?.classOfInsurance}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableClauses.map((clause) => (
              <div key={clause.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  checked={selectedClauses.includes(clause.id)}
                  onCheckedChange={() => toggleClause(clause.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{clause.name}</h4>
                    <Badge className={getCategoryColor(clause.category)}>
                      {clause.category}
                    </Badge>
                    {clause.recommended && (
                      <Badge variant="secondary">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{clause.description}</p>
                  {clause.premium_impact && (
                    <p className={`text-sm font-medium ${clause.premium_impact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Premium Impact: {clause.premium_impact > 0 ? '+' : ''}{clause.premium_impact}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selected Clauses Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedClauses.length === 0 ? (
            <p className="text-gray-500">No clauses selected</p>
          ) : (
            <div className="space-y-2">
              {selectedClauses.map(clauseId => {
                const clause = availableClauses.find(c => c.id === clauseId);
                return clause ? (
                  <div key={clauseId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{clause.name}</span>
                    <Badge className={getCategoryColor(clause.category)}>
                      {clause.category}
                    </Badge>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
