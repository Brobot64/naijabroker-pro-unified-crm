
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFinancialCalculations } from "@/hooks/useFinancialCalculations";
import { Plus, Minus, Calculator } from "lucide-react";

interface InsurerSplit {
  id: string;
  name: string;
  percentage: number;
  isLead: boolean;
}

interface CommissionSplit {
  id: string;
  type: 'foreign' | 'local';
  percentage: number;
  amount: number;
}

interface QuoteIntakeDraftingProps {
  clientData?: any;
  onQuoteSaved: (quoteData: any) => void;
  onBack: () => void;
}

export const QuoteIntakeDrafting = ({ clientData, onQuoteSaved, onBack }: QuoteIntakeDraftingProps) => {
  const [quoteData, setQuoteData] = useState({
    // Top-level data
    transactionDate: new Date().toISOString().split('T')[0],
    commencementDate: "",
    expiryDate: "",
    renewalDate: "",
    currency: "NGN",
    classOfInsurance: "",
    brokerageRate: "10",
    vatFlag: true,
    
    // Financial data
    sumInsured: "",
    basePremium: "",
    
    // Quote details
    quoteNumber: `QTE-${Date.now().toString().slice(-6)}`,
    status: "draft"
  });

  const [insurerSplits, setInsurerSplits] = useState<InsurerSplit[]>([
    { id: '1', name: '', percentage: 100, isLead: true }
  ]);

  const [commissionSplits, setCommissionSplits] = useState<CommissionSplit[]>([
    { id: '1', type: 'local', percentage: 100, amount: 0 }
  ]);

  const [showCommissionSplit, setShowCommissionSplit] = useState(false);
  const { toast } = useToast();
  
  // Use the financial calculations hook
  const {
    grossPremium,
    setGrossPremium,
    commissionRate,
    setCommissionRate,
    calculations,
    validateSplits
  } = useFinancialCalculations();

  useEffect(() => {
    if (quoteData.basePremium) {
      setGrossPremium(parseFloat(quoteData.basePremium) || 0);
    }
  }, [quoteData.basePremium, setGrossPremium]);

  useEffect(() => {
    if (quoteData.brokerageRate) {
      setCommissionRate(parseFloat(quoteData.brokerageRate) || 10);
    }
  }, [quoteData.brokerageRate, setCommissionRate]);

  // Update commission splits when commission amount changes
  useEffect(() => {
    const updatedSplits = commissionSplits.map(split => ({
      ...split,
      amount: calculations.commission * (split.percentage / 100)
    }));
    setCommissionSplits(updatedSplits);
  }, [calculations.commission]);

  const addInsurerSplit = () => {
    const newSplit: InsurerSplit = {
      id: Date.now().toString(),
      name: '',
      percentage: 0,
      isLead: false
    };
    setInsurerSplits([...insurerSplits, newSplit]);
  };

  const removeInsurerSplit = (id: string) => {
    if (insurerSplits.length > 1) {
      setInsurerSplits(insurerSplits.filter(split => split.id !== id));
    }
  };

  const updateInsurerSplit = (id: string, field: string, value: any) => {
    setInsurerSplits(splits => splits.map(split => {
      if (split.id === id) {
        if (field === 'isLead' && value) {
          // Only one lead underwriter allowed
          splits.forEach(s => s.isLead = false);
        }
        return { ...split, [field]: value };
      }
      return split;
    }));
  };

  const addCommissionSplit = () => {
    const newSplit: CommissionSplit = {
      id: Date.now().toString(),
      type: 'local',
      percentage: 0,
      amount: 0
    };
    setCommissionSplits([...commissionSplits, newSplit]);
  };

  const removeCommissionSplit = (id: string) => {
    if (commissionSplits.length > 1) {
      setCommissionSplits(commissionSplits.filter(split => split.id !== id));
    }
  };

  const updateCommissionSplit = (id: string, field: string, value: any) => {
    setCommissionSplits(splits => splits.map(split => 
      split.id === id ? { ...split, [field]: value } : split
    ));
  };

  const validateInsurerSplits = () => {
    const totalPercentage = insurerSplits.reduce((sum, split) => sum + split.percentage, 0);
    const hasLead = insurerSplits.some(split => split.isLead);
    const allNamed = insurerSplits.every(split => split.name.trim() !== '');
    
    return {
      isValid: Math.abs(totalPercentage - 100) < 0.01 && hasLead && allNamed,
      totalPercentage,
      hasLead,
      allNamed
    };
  };

  const validateCommissionSplits = () => {
    const totalPercentage = commissionSplits.reduce((sum, split) => sum + split.percentage, 0);
    return {
      isValid: Math.abs(totalPercentage - 100) < 0.01,
      totalPercentage
    };
  };

  const handleSaveDraft = async () => {
    // Validation
    if (!quoteData.classOfInsurance || !quoteData.commencementDate || !quoteData.expiryDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const insurerValidation = validateInsurerSplits();
    if (!insurerValidation.isValid) {
      let message = "Insurer split validation failed: ";
      if (!insurerValidation.allNamed) message += "All insurers must be named. ";
      if (!insurerValidation.hasLead) message += "Must designate one lead underwriter. ";
      if (Math.abs(insurerValidation.totalPercentage - 100) >= 0.01) {
        message += `Total percentage is ${insurerValidation.totalPercentage.toFixed(2)}%, must equal 100%.`;
      }
      
      toast({
        title: "Validation Error",
        description: message,
        variant: "destructive"
      });
      return;
    }

    if (showCommissionSplit) {
      const commissionValidation = validateCommissionSplits();
      if (!commissionValidation.isValid) {
        toast({
          title: "Validation Error",
          description: `Commission split total is ${commissionValidation.totalPercentage.toFixed(2)}%, must equal 100%`,
          variant: "destructive"
        });
        return;
      }
    }

    const completeQuoteData = {
      ...quoteData,
      client: clientData,
      insurerSplits,
      commissionSplits: showCommissionSplit ? commissionSplits : null,
      calculations,
      createdAt: new Date().toISOString()
    };

    toast({
      title: "Quote Saved",
      description: `Quote ${quoteData.quoteNumber} saved as draft`,
    });

    onQuoteSaved(completeQuoteData);
  };

  const insurerValidation = validateInsurerSplits();
  const commissionValidation = validateCommissionSplits();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quote Intake & Drafting</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleSaveDraft}>Save Draft</Button>
        </div>
      </div>

      {clientData && (
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Client Name</Label>
                <p className="font-medium">{clientData.name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p>{clientData.email}</p>
              </div>
              <div>
                <Label>Phone</Label>
                <p>{clientData.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top-level Quote Data */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quoteNumber">Quote Number</Label>
              <Input
                id="quoteNumber"
                value={quoteData.quoteNumber}
                onChange={(e) => setQuoteData({...quoteData, quoteNumber: e.target.value})}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="transactionDate">Transaction Date</Label>
              <Input
                id="transactionDate"
                type="date"
                value={quoteData.transactionDate}
                onChange={(e) => setQuoteData({...quoteData, transactionDate: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="commencementDate">Commencement Date *</Label>
              <Input
                id="commencementDate"
                type="date"
                value={quoteData.commencementDate}
                onChange={(e) => setQuoteData({...quoteData, commencementDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={quoteData.expiryDate}
                onChange={(e) => setQuoteData({...quoteData, expiryDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="renewalDate">Renewal Date</Label>
              <Input
                id="renewalDate"
                type="date"
                value={quoteData.renewalDate}
                onChange={(e) => setQuoteData({...quoteData, renewalDate: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={quoteData.currency} onValueChange={(value) => setQuoteData({...quoteData, currency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="classOfInsurance">Class of Insurance *</Label>
              <Select value={quoteData.classOfInsurance} onValueChange={(value) => setQuoteData({...quoteData, classOfInsurance: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motor">Motor Insurance</SelectItem>
                  <SelectItem value="fire">Fire & Special Perils</SelectItem>
                  <SelectItem value="marine">Marine Insurance</SelectItem>
                  <SelectItem value="aviation">Aviation Insurance</SelectItem>
                  <SelectItem value="engineering">Engineering Insurance</SelectItem>
                  <SelectItem value="liability">Public Liability</SelectItem>
                  <SelectItem value="workmen">Workmen Compensation</SelectItem>
                  <SelectItem value="bonds">Bonds & Guarantees</SelectItem>
                  <SelectItem value="life">Life Assurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="brokerageRate">Brokerage Rate (%)</Label>
              <Input
                id="brokerageRate"
                type="number"
                step="0.01"
                value={quoteData.brokerageRate}
                onChange={(e) => setQuoteData({...quoteData, brokerageRate: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vatFlag"
              checked={quoteData.vatFlag}
              onCheckedChange={(checked) => setQuoteData({...quoteData, vatFlag: checked as boolean})}
            />
            <Label htmlFor="vatFlag">Apply VAT (7.5%)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Financial Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Financial Calculations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sumInsured">Sum Insured ({quoteData.currency})</Label>
              <Input
                id="sumInsured"
                type="number"
                value={quoteData.sumInsured}
                onChange={(e) => setQuoteData({...quoteData, sumInsured: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="basePremium">Base Premium ({quoteData.currency})</Label>
              <Input
                id="basePremium"
                type="number"
                value={quoteData.basePremium}
                onChange={(e) => setQuoteData({...quoteData, basePremium: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Real-time calculations display */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">Real-time Calculations</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Gross Premium:</span>
                <span className="font-medium ml-2">{quoteData.currency} {calculations.grossPremium.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">VAT (7.5%):</span>
                <span className="font-medium ml-2">{quoteData.currency} {calculations.vat.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Net Premium:</span>
                <span className="font-medium ml-2">{quoteData.currency} {calculations.netPremium.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Commission ({commissionRate}%):</span>
                <span className="font-medium ml-2">{quoteData.currency} {calculations.commission.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurer Splits */}
      <Card>
        <CardHeader>
          <CardTitle>Insurer Participation</CardTitle>
          <div className="text-sm text-gray-600">
            Total: {insurerSplits.reduce((sum, split) => sum + split.percentage, 0).toFixed(2)}%
            {!insurerValidation.isValid && (
              <Badge variant="destructive" className="ml-2">Invalid</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {insurerSplits.map((split, index) => (
            <div key={split.id} className="grid grid-cols-4 gap-4 items-center">
              <div>
                <Label>Insurer Name</Label>
                <Input
                  value={split.name}
                  onChange={(e) => updateInsurerSplit(split.id, 'name', e.target.value)}
                  placeholder="Insurance company name"
                />
              </div>
              <div>
                <Label>Participation %</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={split.percentage}
                  onChange={(e) => updateInsurerSplit(split.id, 'percentage', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={split.isLead}
                  onCheckedChange={(checked) => updateInsurerSplit(split.id, 'isLead', checked)}
                />
                <Label>Lead Underwriter</Label>
              </div>
              <div>
                {insurerSplits.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeInsurerSplit(split.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          <Button variant="outline" onClick={addInsurerSplit}>
            <Plus className="h-4 w-4 mr-2" />
            Add Co-Insurer
          </Button>
        </CardContent>
      </Card>

      {/* Commission Split */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Split</CardTitle>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={showCommissionSplit}
              onCheckedChange={setShowCommissionSplit}
            />
            <Label>Enable commission splitting</Label>
          </div>
        </CardHeader>
        {showCommissionSplit && (
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Total Commission: {quoteData.currency} {calculations.commission.toLocaleString()}
              | Split Total: {commissionSplits.reduce((sum, split) => sum + split.percentage, 0).toFixed(2)}%
              {!commissionValidation.isValid && (
                <Badge variant="destructive" className="ml-2">Invalid</Badge>
              )}
            </div>
            
            {commissionSplits.map((split) => (
              <div key={split.id} className="grid grid-cols-4 gap-4 items-center">
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={split.type} 
                    onValueChange={(value: 'foreign' | 'local') => updateCommissionSplit(split.id, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="foreign">Foreign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Percentage %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={split.percentage}
                    onChange={(e) => updateCommissionSplit(split.id, 'percentage', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Amount ({quoteData.currency})</Label>
                  <Input
                    value={split.amount.toLocaleString()}
                    disabled
                  />
                </div>
                <div>
                  {commissionSplits.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCommissionSplit(split.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <Button variant="outline" onClick={addCommissionSplit}>
              <Plus className="h-4 w-4 mr-2" />
              Add Commission Split
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
