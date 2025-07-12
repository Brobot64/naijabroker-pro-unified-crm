
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [prompt, setPrompt] = useState(quoteData?.coverage_requirements || '');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { toast } = useToast();

  const clauseCategories = [
    { id: 'extension', label: 'Extension', description: 'Additional coverage and benefits' },
    { id: 'exclusion', label: 'Exclusions', description: 'Items not covered by the policy' },
    { id: 'condition', label: 'Conditions', description: 'Terms and conditions of coverage' },
    { id: 'deductible', label: 'Deductible', description: 'Amount paid before coverage applies' },
    { id: 'warranty', label: 'Warranty', description: 'Promises made by the insured' },
    { id: 'excess', label: 'Excess', description: 'Additional deductible amounts' }
  ];

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const generateSuggestions = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe your coverage needs",
        variant: "destructive"
      });
      return;
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one clause category",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const categoriesText = selectedCategories.join(', ');
      // Create detailed prompt using quote data and selected categories
      const detailedPrompt = `
        Generate specific insurance policy clauses based on this quote information:
        
        Policy Type: ${policyType}
        Sum Insured: ₦${sumInsured?.toLocaleString()}
        Insured Item: ${quoteData?.insured_item || 'Not specified'}
        Location: ${quoteData?.location || 'Not specified'}
        Risk Details: ${quoteData?.risk_details || 'Not specified'}
        Coverage Requirements: ${quoteData?.coverage_requirements || 'Not specified'}
        
        User specific request: ${prompt}
        Selected clause categories to focus on: ${categoriesText}
        
        Please provide 2-3 relevant policy clauses focusing on the selected categories: ${categoriesText}
        Return results in this exact JSON format:
        [
          {
            "name": "Clause Name",
            "description": "Brief description", 
            "category": "one of: ${categoriesText}",
            "clause_text": "Full clause text",
            "premium_impact_type": "percentage",
            "premium_impact_value": 0.0,
            "confidence": 0.85
          }
        ]
        
        Make sure clauses are specific to the policy type, risk profile, and selected categories. Return only valid JSON.
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

        <div>
          <label className="text-sm font-medium mb-3 block">Select clause categories to focus on:</label>
          <div className="grid grid-cols-2 gap-3">
            {clauseCategories.map((category) => (
              <div key={category.id} className="flex items-start space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                  disabled={loading}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={category.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.label}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={generateSuggestions} disabled={loading || !prompt.trim() || selectedCategories.length === 0}>
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
