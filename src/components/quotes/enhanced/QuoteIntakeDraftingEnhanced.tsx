
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowContext } from '../QuoteWorkflowProvider';
import { useToast } from "@/hooks/use-toast";
import { QuoteService } from '@/services/database/quoteService';
import { calculateFinancials } from '@/utils/financialCalculations';
import { useAuth } from '@/contexts/AuthContext';

interface QuoteIntakeDraftingEnhancedProps {
  clientData: any;
  onQuoteSaved: (quoteData: any) => void;
  onBack: () => void;
}

const POLICY_TYPES = [
  { value: 'motor', label: 'Motor Insurance' },
  { value: 'fire', label: 'Fire & Allied Perils' },
  { value: 'marine', label: 'Marine Insurance' },
  { value: 'aviation', label: 'Aviation Insurance' },
  { value: 'general-accident', label: 'General Accident' },
  { value: 'engineering', label: 'Engineering Insurance' },
  { value: 'professional-indemnity', label: 'Professional Indemnity' },
  { value: 'public-liability', label: 'Public Liability' },
  { value: 'directors-officers', label: 'Directors & Officers' },
  { value: 'cyber', label: 'Cyber Insurance' },
];

const UNDERWRITERS = [
  { value: 'aiico', label: 'AIICO Insurance' },
  { value: 'leadway', label: 'Leadway Assurance' },
  { value: 'axa-mansard', label: 'AXA Mansard' },
  { value: 'cornerstone', label: 'Cornerstone Insurance' },
  { value: 'sovereign-trust', label: 'Sovereign Trust Insurance' },
  { value: 'lasaco', label: 'LASACO Assurance' },
  { value: 'consolidated-hallmark', label: 'Consolidated Hallmark' },
];

export const QuoteIntakeDraftingEnhanced = ({ clientData, onQuoteSaved, onBack }: QuoteIntakeDraftingEnhancedProps) => {
  const { state, dispatch } = useWorkflowContext();
  const { organizationId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    policy_type: '',
    underwriter: '',
    sum_insured: 0,
    premium: 0,
    commission_rate: 12.5,
    valid_until: '',
    terms_conditions: '',
    notes: '',
    // New fields for insured details
    insured_item: '',
    insured_description: '',
    location: '',
    risk_details: '',
    coverage_requirements: '',
  });

  const [calculations, setCalculations] = useState({
    commission: 0,
    netPremium: 0,
    vat: 0,
    grossPremium: 0,
  });

  useEffect(() => {
    // Load saved data if available
    if (state.workflowData.quote) {
      setFormData(state.workflowData.quote);
    }
    
    // Set default validity date (30 days from today)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    if (!formData.valid_until) {
      setFormData(prev => ({
        ...prev,
        valid_until: defaultDate.toISOString().split('T')[0]
      }));
    }
  }, []);

  useEffect(() => {
    // Recalculate financials when relevant fields change
    if (formData.premium && formData.commission_rate) {
      const calcs = calculateFinancials(formData.premium, formData.commission_rate);
      setCalculations({
        commission: calcs.commission,
        netPremium: calcs.netPremium,
        vat: calcs.vat,
        grossPremium: calcs.grossPremium,
      });
    }
  }, [formData.premium, formData.commission_rate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateQuoteNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QTE-${year}${month}-${random}`;
  };

  const handleSubmit = async () => {
    if (!formData.policy_type || !formData.underwriter || !formData.sum_insured) {
      toast({
        title: "Validation Error",
        description: "Policy type, underwriter, and sum insured are required",
        variant: "destructive"
      });
      return;
    }

    if (!organizationId) {
      toast({
        title: "Error",
        description: "Organization not found",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const quoteData = {
        quote_number: generateQuoteNumber(),
        client_name: clientData.name,
        client_email: clientData.email,
        client_phone: clientData.phone,
        client_id: clientData.id,
        organization_id: organizationId,
        ...formData,
        calculations: calculations,
        status: 'draft' as const,
        workflow_stage: 'quote-drafting',
      };

      const savedQuote = await QuoteService.create(quoteData);

      // Save to workflow state
      dispatch({ type: 'SET_DATA', payload: { key: 'quote', data: savedQuote } });
      dispatch({ type: 'COMPLETE_STEP', payload: 'quote-drafting' });

      toast({
        title: "Success",
        description: "Quote saved successfully",
      });

      onQuoteSaved(savedQuote);
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        title: "Error",
        description: "Failed to save quote",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Intake & Drafting</CardTitle>
        <p className="text-sm text-gray-600">
          Client: {clientData?.name} ({clientData?.email})
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Policy Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="policy_type">Class of Insurance *</Label>
            <Select value={formData.policy_type} onValueChange={(value) => handleInputChange('policy_type', value)} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select insurance class..." />
              </SelectTrigger>
              <SelectContent>
                {POLICY_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="underwriter">Preferred Underwriter *</Label>
            <Select value={formData.underwriter} onValueChange={(value) => handleInputChange('underwriter', value)} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select underwriter..." />
              </SelectTrigger>
              <SelectContent>
                {UNDERWRITERS.map(underwriter => (
                  <SelectItem key={underwriter.value} value={underwriter.value}>{underwriter.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* What is being insured */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What is being insured?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insured_item">Item/Asset *</Label>
              <Input
                id="insured_item"
                value={formData.insured_item}
                onChange={(e) => handleInputChange('insured_item', e.target.value)}
                placeholder="e.g., Building, Vehicle, Equipment"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Physical location of insured item"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="insured_description">Detailed Description</Label>
            <Textarea
              id="insured_description"
              value={formData.insured_description}
              onChange={(e) => handleInputChange('insured_description', e.target.value)}
              placeholder="Provide detailed description of what is being insured..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_details">Risk Assessment</Label>
            <Textarea
              id="risk_details"
              value={formData.risk_details}
              onChange={(e) => handleInputChange('risk_details', e.target.value)}
              placeholder="Describe potential risks and hazards..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverage_requirements">Coverage Requirements</Label>
            <Textarea
              id="coverage_requirements"
              value={formData.coverage_requirements}
              onChange={(e) => handleInputChange('coverage_requirements', e.target.value)}
              placeholder="Specific coverage requirements from client..."
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sum_insured">Sum Insured (₦) *</Label>
            <Input
              id="sum_insured"
              type="number"
              value={formData.sum_insured}
              onChange={(e) => handleInputChange('sum_insured', parseFloat(e.target.value) || 0)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="premium">Premium (₦)</Label>
            <Input
              id="premium"
              type="number"
              value={formData.premium}
              onChange={(e) => handleInputChange('premium', parseFloat(e.target.value) || 0)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission_rate">Commission Rate (%)</Label>
            <Input
              id="commission_rate"
              type="number"
              step="0.1"
              value={formData.commission_rate}
              onChange={(e) => handleInputChange('commission_rate', parseFloat(e.target.value) || 0)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valid_until">Quote Valid Until</Label>
            <Input
              id="valid_until"
              type="date"
              value={formData.valid_until}
              onChange={(e) => handleInputChange('valid_until', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Financial Summary */}
        {formData.premium > 0 && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>Commission Amount: ₦{calculations.commission.toLocaleString()}</div>
              <div>VAT Amount: ₦{calculations.vat.toLocaleString()}</div>
              <div>Net Premium: ₦{calculations.netPremium.toLocaleString()}</div>
              <div className="font-semibold">Gross Premium: ₦{calculations.grossPremium.toLocaleString()}</div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} disabled={loading}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
