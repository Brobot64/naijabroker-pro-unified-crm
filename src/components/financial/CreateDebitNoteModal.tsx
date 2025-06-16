
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { useFinancialCalculations } from "@/hooks/useFinancialCalculations";
import { useToast } from "@/hooks/use-toast";

interface CreateDebitNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateDebitNoteModal = ({ open, onOpenChange }: CreateDebitNoteModalProps) => {
  const [policyNumber, setPolicyNumber] = useState("");
  const [endorsementNumber, setEndorsementNumber] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [coBrokers, setCoBrokers] = useState<string[]>([]);
  
  const { grossPremium, setGrossPremium, calculations } = useFinancialCalculations();
  const { toast } = useToast();

  const handleCreateDebitNote = () => {
    // Validation
    if (!policyNumber || !selectedClient || grossPremium <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    // Duplicate prevention check
    const existingNotes = [
      { policyNumber: "POL-2024-001234", status: "refused" },
      { policyNumber: "POL-2024-001235", status: "paid" }
    ];

    const duplicateRefused = existingNotes.find(
      note => note.policyNumber === policyNumber && note.status === "refused"
    );

    if (duplicateRefused) {
      toast({
        title: "Duplicate Prevention",
        description: "This policy has a refused debit note and cannot be resubmitted.",
        variant: "destructive",
      });
      return;
    }

    console.log('Creating debit note with real-time calculations:', {
      policyNumber,
      endorsementNumber,
      client: selectedClient,
      calculations,
      coBrokers,
      timestamp: new Date().toISOString()
    });
    
    toast({
      title: "Debit Note Created",
      description: `Debit note created successfully with net premium of ₦${calculations.netPremium.toLocaleString()}`,
    });
    
    onOpenChange(false);
    // Reset form
    setPolicyNumber("");
    setEndorsementNumber("");
    setSelectedClient("");
    setGrossPremium(0);
    setCoBrokers([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Debit Note - Real-Time Calculations</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Real-time calculations enabled. VAT (7.5%) and net premium update automatically with duplicate prevention.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="policyNumber">Policy Number*</Label>
              <Input 
                id="policyNumber" 
                placeholder="POL-2024-XXXXX"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endorsementNumber">Endorsement Number (Optional)</Label>
              <Input 
                id="endorsementNumber" 
                placeholder="END-2024-XXXXX"
                value={endorsementNumber}
                onChange={(e) => setEndorsementNumber(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="client">Client*</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dangote">Dangote Industries Ltd</SelectItem>
                <SelectItem value="gtbank">GTBank Plc</SelectItem>
                <SelectItem value="firstbank">First Bank Plc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="grossPremium">Gross Premium (₦)*</Label>
              <Input 
                id="grossPremium" 
                type="number" 
                placeholder="0.00"
                value={grossPremium || ''}
                onChange={(e) => setGrossPremium(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>VAT (7.5%)</Label>
              <Input 
                readOnly 
                value={`₦${calculations.vat.toLocaleString()}`}
                className="bg-gray-50" 
              />
            </div>
            <div>
              <Label>Net Premium</Label>
              <Input 
                readOnly 
                value={`₦${calculations.netPremium.toLocaleString()}`}
                className="bg-gray-50 font-semibold" 
              />
            </div>
          </div>

          <div>
            <Label>Co-Brokers (Optional)</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Add co-brokers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="broker1">ABC Insurance Brokers</SelectItem>
                <SelectItem value="broker2">XYZ Risk Advisors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDebitNote}>
              Create Debit Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
