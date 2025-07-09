
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Bot, Loader2, Plus } from "lucide-react";

interface AIClauseAssistantProps {
  policyType: string;
  sumInsured: number;
  quoteData?: any;
  onClauseSuggested: (clause: {
    name: string;
    description: string;
    category: string;
    clause_text: string;
    premium_impact_type: 'percentage' | 'fixed' | 'none';
    premium_impact_value: number;
  }) => void;
}

export const AIClauseAssistant = ({ policyType, sumInsured, quoteData, onClauseSuggested }: AIClauseAssistantProps) => {
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
      // Create detailed prompt using quote data
      const detailedPrompt = `
        Generate specific insurance policy clauses based on this quote information:
        
        Policy Type: ${policyType}
        Sum Insured: ₦${sumInsured?.toLocaleString()}
        Insured Item: ${quoteData?.insured_item || 'Not specified'}
        Location: ${quoteData?.location || 'Not specified'}
        Risk Details: ${quoteData?.risk_details || 'Not specified'}
        Coverage Requirements: ${quoteData?.coverage_requirements || 'Not specified'}
        
        User specific request: ${prompt}
        
        Please provide 2-3 relevant policy clauses in this exact JSON format:
        [
          {
            "name": "Clause Name",
            "description": "Brief description", 
            "category": "extension",
            "clause_text": "Full clause text",
            "premium_impact_type": "percentage",
            "premium_impact_value": 0.0,
            "confidence": 0.85
          }
        ]
        
        Make sure clauses are specific to the policy type and risk profile. Return only valid JSON.
      `;

      const { data, error } = await supabase.functions.invoke('generate-text-ai', {
        body: { prompt: detailedPrompt, maxTokens: 800 }
      });

      if (error) {
        throw error;
      }

      if (data?.generatedText) {
        try {
          // Try to parse JSON response
          const jsonMatch = data.generatedText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedSuggestions = JSON.parse(jsonMatch[0]);
            setSuggestions(parsedSuggestions);
            toast({
              title: "Suggestions Generated",
              description: `Generated ${parsedSuggestions.length} clause suggestions`
            });
          } else {
            throw new Error('Invalid JSON format in AI response');
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          // Fallback to based suggestions using quote data
          const fallbackSuggestions = [
            {
              name: `${policyType} Coverage Extension`,
              description: `Enhanced coverage for ${quoteData?.insured_item || 'the insured property'}`,
              category: "extension",
              clause_text: `This policy is extended to cover ${prompt.toLowerCase()} for ${quoteData?.insured_item || 'the insured property'} located at ${quoteData?.location || 'the specified location'}, subject to the terms and conditions herein.`,
              premium_impact_type: "percentage" as const,
              premium_impact_value: 2.5,
              confidence: 0.80
            },
            {
              name: "Risk Mitigation Warranty",
              description: "Risk management requirements based on assessment",
              category: "warranty",
              clause_text: `The insured warrants to implement appropriate risk mitigation measures for ${quoteData?.insured_item || 'the insured property'}, taking into account ${quoteData?.risk_details || 'the identified risk factors'}.`,
              premium_impact_type: "percentage" as const,
              premium_impact_value: -1.0,
              confidence: 0.75
            }
          ];
          setSuggestions(fallbackSuggestions);
          toast({
            title: "Suggestions Generated",
            description: "Generated clause recommendations based on your quote data"
          });
        }
      }
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
