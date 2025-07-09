
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ClauseService, Clause, QuoteClause } from '@/services/database/clauseService';
import { AddOnService, AddOn, QuoteAddOn } from '@/services/database/addOnService';
import { AIClauseAssistant } from './AIClauseAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Edit, Sparkles } from "lucide-react";

interface ClauseRecommendationEnhancedProps {
  quoteData: any;
  onClausesSelected: (data: { clauses: QuoteClause[], addOns: QuoteAddOn[] }) => void;
  onBack: () => void;
}

export const ClauseRecommendationEnhanced = ({ quoteData, onClausesSelected, onBack }: ClauseRecommendationEnhancedProps) => {
  const { organizationId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Template data
  const [availableClauses, setAvailableClauses] = useState<Clause[]>([]);
  const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([]);

  // Selected items
  const [selectedClauses, setSelectedClauses] = useState<QuoteClause[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<QuoteAddOn[]>([]);

  // Manual entry states
  const [showManualClause, setShowManualClause] = useState(false);
  const [showManualAddOn, setShowManualAddOn] = useState(false);
  const [manualClause, setManualClause] = useState({
    name: '',
    description: '',
    category: 'extension',
    clause_text: '',
    premium_impact_type: 'none' as const,
    premium_impact_value: 0
  });
  const [manualAddOn, setManualAddOn] = useState({
    name: '',
    description: '',
    coverage_details: '',
    premium_impact_type: 'none' as const,
    premium_impact_value: 0,
    sum_insured_impact: 0
  });

  useEffect(() => {
    if (organizationId && quoteData.policy_type) {
      loadTemplates();
    }
  }, [organizationId, quoteData.policy_type]);

  const loadTemplates = async () => {
    if (!organizationId) return;
    
    try {
      const [clauses, addOns] = await Promise.all([
        ClauseService.getByPolicyType(organizationId, quoteData.policy_type),
        AddOnService.getByPolicyType(organizationId, quoteData.policy_type)
      ]);
      
      setAvailableClauses(clauses);
      setAvailableAddOns(addOns);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load clause and add-on templates",
        variant: "destructive"
      });
    }
  };

  const addClauseFromTemplate = (clause: Clause) => {
    if (!organizationId) return;

    const newClause: QuoteClause = {
      id: `temp-${Date.now()}`,
      quote_id: quoteData.id || 'temp',
      clause_id: clause.id,
      category: clause.category,
      premium_impact_type: clause.premium_impact_type,
      premium_impact_value: clause.premium_impact_value,
      is_custom: false,
      organization_id: organizationId,
      created_at: new Date().toISOString()
    };

    setSelectedClauses([...selectedClauses, newClause]);
    toast({
      title: "Clause Added",
      description: `Added "${clause.name}" to quote`
    });
  };

  const addAddOnFromTemplate = (addOn: AddOn) => {
    if (!organizationId) return;

    const newAddOn: QuoteAddOn = {
      id: `temp-${Date.now()}`,
      quote_id: quoteData.id || 'temp',
      add_on_id: addOn.id,
      premium_impact_type: addOn.premium_impact_type,
      premium_impact_value: addOn.premium_impact_value,
      sum_insured_impact: addOn.sum_insured_impact,
      is_custom: false,
      organization_id: organizationId,
      created_at: new Date().toISOString()
    };

    setSelectedAddOns([...selectedAddOns, newAddOn]);
    toast({
      title: "Add-on Added",
      description: `Added "${addOn.name}" to quote`
    });
  };

  const addManualClause = () => {
    if (!organizationId || !manualClause.name || !manualClause.clause_text) {
      toast({
        title: "Validation Error",
        description: "Name and clause text are required",
        variant: "destructive"
      });
      return;
    }

    const newClause: QuoteClause = {
      id: `temp-${Date.now()}`,
      quote_id: quoteData.id || 'temp',
      custom_name: manualClause.name,
      custom_description: manualClause.description,
      custom_clause_text: manualClause.clause_text,
      category: manualClause.category,
      premium_impact_type: manualClause.premium_impact_type,
      premium_impact_value: manualClause.premium_impact_value,
      is_custom: true,
      organization_id: organizationId,
      created_at: new Date().toISOString()
    };

    setSelectedClauses([...selectedClauses, newClause]);
    setManualClause({
      name: '',
      description: '',
      category: 'extension',
      clause_text: '',
      premium_impact_type: 'none',
      premium_impact_value: 0
    });
    setShowManualClause(false);
    
    toast({
      title: "Custom Clause Added",
      description: `Added "${manualClause.name}" to quote`
    });
  };

  const addManualAddOn = () => {
    if (!organizationId || !manualAddOn.name) {
      toast({
        title: "Validation Error",
        description: "Add-on name is required",
        variant: "destructive"
      });
      return;
    }

    const newAddOn: QuoteAddOn = {
      id: `temp-${Date.now()}`,
      quote_id: quoteData.id || 'temp',
      custom_name: manualAddOn.name,
      custom_description: manualAddOn.description,
      custom_coverage_details: manualAddOn.coverage_details,
      premium_impact_type: manualAddOn.premium_impact_type,
      premium_impact_value: manualAddOn.premium_impact_value,
      sum_insured_impact: manualAddOn.sum_insured_impact,
      is_custom: true,
      organization_id: organizationId,
      created_at: new Date().toISOString()
    };

    setSelectedAddOns([...selectedAddOns, newAddOn]);
    setManualAddOn({
      name: '',
      description: '',
      coverage_details: '',
      premium_impact_type: 'none',
      premium_impact_value: 0,
      sum_insured_impact: 0
    });
    setShowManualAddOn(false);
    
    toast({
      title: "Custom Add-on Added",
      description: `Added "${manualAddOn.name}" to quote`
    });
  };

  const removeClause = (id: string) => {
    setSelectedClauses(selectedClauses.filter(c => c.id !== id));
  };

  const removeAddOn = (id: string) => {
    setSelectedAddOns(selectedAddOns.filter(a => a.id !== id));
  };

  const handleContinue = () => {
    onClausesSelected({
      clauses: selectedClauses,
      addOns: selectedAddOns
    });
  };

  const getClauseName = (clause: QuoteClause) => {
    if (clause.is_custom) return clause.custom_name;
    const template = availableClauses.find(c => c.id === clause.clause_id);
    return template?.name || 'Unknown Clause';
  };

  const getAddOnName = (addOn: QuoteAddOn) => {
    if (addOn.is_custom) return addOn.custom_name;
    const template = availableAddOns.find(a => a.id === addOn.add_on_id);
    return template?.name || 'Unknown Add-on';
  };

  const handleAISuggestion = (suggestion: any) => {
    if (!organizationId) return;

    const newClause: QuoteClause = {
      id: `temp-${Date.now()}`,
      quote_id: quoteData.id || 'temp',
      custom_name: suggestion.name,
      custom_description: suggestion.description,
      custom_clause_text: suggestion.clause_text,
      category: suggestion.category,
      premium_impact_type: suggestion.premium_impact_type,
      premium_impact_value: suggestion.premium_impact_value,
      is_custom: true,
      organization_id: organizationId,
      created_at: new Date().toISOString()
    };

    setSelectedClauses([...selectedClauses, newClause]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clause & Add-on Recommendations</CardTitle>
        <p className="text-sm text-gray-600">
          Policy: {quoteData.policy_type} | Sum Insured: ₦{quoteData.sum_insured?.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Assistant */}
        <AIClauseAssistant
          policyType={quoteData.policy_type}
          sumInsured={quoteData.sum_insured || 0}
          quoteData={quoteData}
          onClauseSuggested={handleAISuggestion}
        />

        <Tabs defaultValue="clauses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clauses">Policy Clauses</TabsTrigger>
            <TabsTrigger value="addons">Add-ons</TabsTrigger>
          </TabsList>

          <TabsContent value="clauses" className="space-y-4">
            {/* Template Clauses */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Available Clauses</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualClause(!showManualClause)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Custom
                </Button>
              </div>

              {showManualClause && (
                <Card className="mb-4">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Clause Name *</Label>
                        <Input
                          value={manualClause.name}
                          onChange={(e) => setManualClause({...manualClause, name: e.target.value})}
                          placeholder="Enter clause name"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select value={manualClause.category} onValueChange={(value) => setManualClause({...manualClause, category: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="extension">Extension</SelectItem>
                            <SelectItem value="exclusion">Exclusion</SelectItem>
                            <SelectItem value="warranty">Warranty</SelectItem>
                            <SelectItem value="deductible">Deductible</SelectItem>
                            <SelectItem value="condition">Condition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        value={manualClause.description}
                        onChange={(e) => setManualClause({...manualClause, description: e.target.value})}
                        placeholder="Brief description"
                      />
                    </div>

                    <div>
                      <Label>Clause Text *</Label>
                      <Textarea
                        value={manualClause.clause_text}
                        onChange={(e) => setManualClause({...manualClause, clause_text: e.target.value})}
                        placeholder="Enter the full clause text"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Premium Impact</Label>
                        <Select value={manualClause.premium_impact_type} onValueChange={(value: any) => setManualClause({...manualClause, premium_impact_type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Impact</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {manualClause.premium_impact_type !== 'none' && (
                        <div>
                          <Label>Impact Value</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={manualClause.premium_impact_value}
                            onChange={(e) => setManualClause({...manualClause, premium_impact_value: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={addManualClause}>Add Clause</Button>
                      <Button variant="outline" onClick={() => setShowManualClause(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {availableClauses.map((clause) => (
                  <Card key={clause.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{clause.name}</h5>
                          <Badge variant="outline">{clause.category}</Badge>
                          {clause.is_recommended && <Badge variant="secondary">Recommended</Badge>}
                          {clause.premium_impact_value !== 0 && (
                            <Badge variant={clause.premium_impact_value > 0 ? "destructive" : "secondary"}>
                              {clause.premium_impact_value > 0 ? '+' : ''}{clause.premium_impact_value}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{clause.description}</p>
                        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">{clause.clause_text}</p>
                      </div>
                      <Button size="sm" onClick={() => addClauseFromTemplate(clause)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Selected Clauses */}
            {selectedClauses.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Selected Clauses ({selectedClauses.length})</h4>
                <div className="space-y-2">
                  {selectedClauses.map((clause) => (
                    <div key={clause.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getClauseName(clause)}</span>
                        <Badge variant="outline">{clause.category}</Badge>
                        {clause.is_custom && <Badge variant="secondary">Custom</Badge>}
                        {clause.premium_impact_value !== 0 && (
                          <Badge variant={clause.premium_impact_value > 0 ? "destructive" : "secondary"}>
                            {clause.premium_impact_value > 0 ? '+' : ''}{clause.premium_impact_value}%
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeClause(clause.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="addons" className="space-y-4">
            {/* Similar structure for Add-ons */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Available Add-ons</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualAddOn(!showManualAddOn)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Custom
                </Button>
              </div>

              {showManualAddOn && (
                <Card className="mb-4">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Add-on Name *</Label>
                        <Input
                          value={manualAddOn.name}
                          onChange={(e) => setManualAddOn({...manualAddOn, name: e.target.value})}
                          placeholder="Enter add-on name"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={manualAddOn.description}
                          onChange={(e) => setManualAddOn({...manualAddOn, description: e.target.value})}
                          placeholder="Brief description"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Coverage Details</Label>
                      <Textarea
                        value={manualAddOn.coverage_details}
                        onChange={(e) => setManualAddOn({...manualAddOn, coverage_details: e.target.value})}
                        placeholder="Describe what this add-on covers"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Premium Impact</Label>
                        <Select value={manualAddOn.premium_impact_type} onValueChange={(value: any) => setManualAddOn({...manualAddOn, premium_impact_type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Impact</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {manualAddOn.premium_impact_type !== 'none' && (
                        <div>
                          <Label>Premium Impact Value</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={manualAddOn.premium_impact_value}
                            onChange={(e) => setManualAddOn({...manualAddOn, premium_impact_value: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      )}
                      <div>
                        <Label>Sum Insured Impact</Label>
                        <Input
                          type="number"
                          value={manualAddOn.sum_insured_impact}
                          onChange={(e) => setManualAddOn({...manualAddOn, sum_insured_impact: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={addManualAddOn}>Add Add-on</Button>
                      <Button variant="outline" onClick={() => setShowManualAddOn(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {availableAddOns.map((addOn) => (
                  <Card key={addOn.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{addOn.name}</h5>
                          <Badge variant="outline">{addOn.category}</Badge>
                          {addOn.is_recommended && <Badge variant="secondary">Recommended</Badge>}
                          {addOn.premium_impact_value !== 0 && (
                            <Badge variant={addOn.premium_impact_value > 0 ? "destructive" : "secondary"}>
                              {addOn.premium_impact_value > 0 ? '+' : ''}{addOn.premium_impact_value}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{addOn.description}</p>
                        {addOn.coverage_details && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">{addOn.coverage_details}</p>
                        )}
                      </div>
                      <Button size="sm" onClick={() => addAddOnFromTemplate(addOn)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Selected Add-ons */}
            {selectedAddOns.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Selected Add-ons ({selectedAddOns.length})</h4>
                <div className="space-y-2">
                  {selectedAddOns.map((addOn) => (
                    <div key={addOn.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getAddOnName(addOn)}</span>
                        {addOn.is_custom && <Badge variant="secondary">Custom</Badge>}
                        {addOn.premium_impact_value !== 0 && (
                          <Badge variant={addOn.premium_impact_value > 0 ? "destructive" : "secondary"}>
                            {addOn.premium_impact_value > 0 ? '+' : ''}{addOn.premium_impact_value}%
                          </Badge>
                        )}
                        {addOn.sum_insured_impact !== 0 && (
                          <Badge variant="outline">
                            SI: ₦{addOn.sum_insured_impact.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeAddOn(addOn.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleContinue}>
            Continue with {selectedClauses.length} clauses & {selectedAddOns.length} add-ons
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
