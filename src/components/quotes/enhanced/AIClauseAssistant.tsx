
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bot, Loader2, Plus } from "lucide-react";

interface AIClauseAssistantProps {
  policyType: string;
  sumInsured: number;
  onClauseSuggested: (clause: {
    name: string;
    description: string;
    category: string;
    clause_text: string;
    premium_impact_type: 'percentage' | 'fixed' | 'none';
    premium_impact_value: number;
  }) => void;
}

export const AIClauseAssistant = ({ policyType, sumInsured, onClauseSuggested }: AIClauseAssistantProps) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe your coverage needs",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate AI response for now - in production you'd call an AI service
      const mockSuggestions = [
        {
          name: "Enhanced Coverage Extension",
          description: "Extended coverage based on your specific requirements",
          category: "extension",
          clause_text: `This policy is extended to cover ${prompt.toLowerCase()}, subject to the terms and conditions herein.`,
          premium_impact_type: "percentage" as const,
          premium_impact_value: 3.5,
          confidence: 0.85
        },
        {
          name: "Risk Mitigation Clause",
          description: "Additional risk protection clause",
          category: "warranty",
          clause_text: `The insured warrants to implement appropriate measures to mitigate risks related to ${prompt.toLowerCase()}.`,
          premium_impact_type: "percentage" as const,
          premium_impact_value: -1.5,
          confidence: 0.78
        }
      ];

      setSuggestions(mockSuggestions);
      toast({
        title: "Suggestions Generated",
        description: `Generated ${mockSuggestions.length} clause suggestions`
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate clause suggestions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addClause = (suggestion: any) => {
    onClauseSuggested({
      name: suggestion.name,
      description: suggestion.description,
      category: suggestion.category,
      clause_text: suggestion.clause_text,
      premium_impact_type: suggestion.premium_impact_type,
      premium_impact_value: suggestion.premium_impact_value
    });
    
    toast({
      title: "Clause Added",
      description: `Added "${suggestion.name}" to quote`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Clause Assistant
        </CardTitle>
        <div className="text-sm text-gray-600">
          Policy: {policyType} | Sum Insured: ₦{sumInsured.toLocaleString()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Describe your coverage needs:</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., I need coverage for equipment breakdown, natural disasters, cyber attacks..."
            rows={3}
            disabled={loading}
          />
        </div>

        <Button onClick={generateSuggestions} disabled={loading || !prompt.trim()}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Bot className="h-4 w-4 mr-2" />
              Generate Clauses
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">AI Suggestions:</h4>
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium">{suggestion.name}</h5>
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{suggestion.category}</Badge>
                      <Badge variant={suggestion.premium_impact_value > 0 ? "destructive" : "secondary"}>
                        {suggestion.premium_impact_value > 0 ? '+' : ''}{suggestion.premium_impact_value}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                    {suggestion.clause_text}
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge variant="outline">
                      Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                    </Badge>
                    <Button size="sm" onClick={() => addClause(suggestion)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Clause
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
