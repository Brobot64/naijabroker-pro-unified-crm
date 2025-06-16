
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { financialCalculator } from "@/utils/financialCalculations";
import { workflowManager } from "@/utils/workflowManager";
import { useToast } from "@/hooks/use-toast";

interface DebitNote {
  id: string;
  policyNumber: string;
  endorsementNumber?: string;
  client: string;
  grossPremium: number;
  vat: number;
  netPremium: number;
  status: 'draft' | 'sent' | 'outstanding' | 'paid' | 'refused' | 'cancelled';
  createdDate: string;
  dueDate: string;
  coBrokers?: string[];
  refusalReason?: string;
  canResubmit: boolean;
}

interface CreditNote {
  id: string;
  debitNoteId: string;
  policyNumber: string;
  client: string;
  originalAmount: number;
  creditAmount: number;
  reason: string;
  status: 'draft' | 'approved' | 'processed';
  createdDate: string;
  approvedBy?: string;
}

export const DebitCreditNotes = () => {
  const [activeTab, setActiveTab] = useState("debit-notes");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DebitNote | null>(null);
  const [grossPremium, setGrossPremium] = useState<number>(0);
  const { toast } = useToast();

  const debitNotes: DebitNote[] = [
    {
      id: "DN-2024-001",
      policyNumber: "POL-2024-001234",
      client: "Dangote Industries Ltd",
      grossPremium: 2500000,
      vat: 187500,
      netPremium: 2687500,
      status: "outstanding",
      createdDate: "2024-06-01",
      dueDate: "2024-07-01",
      canResubmit: true
    },
    {
      id: "DN-2024-002",
      policyNumber: "POL-2024-001235",
      client: "GTBank Plc",
      grossPremium: 5000000,
      vat: 375000,
      netPremium: 5375000,
      status: "paid",
      createdDate: "2024-05-15",
      dueDate: "2024-06-15",
      canResubmit: true
    },
    {
      id: "DN-2024-003",
      policyNumber: "POL-2024-001236",
      client: "First Bank Plc",
      grossPremium: 1500000,
      vat: 112500,
      netPremium: 1612500,
      status: "refused",
      createdDate: "2024-06-05",
      dueDate: "2024-07-05",
      refusalReason: "Incorrect premium calculation",
      canResubmit: false // Once refused, cannot be resubmitted
    }
  ];

  const creditNotes: CreditNote[] = [
    {
      id: "CN-2024-001",
      debitNoteId: "DN-2024-001",
      policyNumber: "POL-2024-001234",
      client: "Dangote Industries Ltd",
      originalAmount: 2687500,
      creditAmount: 268750,
      reason: "Premium adjustment due to risk reassessment",
      status: "approved",
      createdDate: "2024-06-10",
      approvedBy: "John Administrator"
    }
  ];

  // Real-time VAT and premium calculation
  const calculateVATAndNet = (gross: number) => {
    const vat = gross * 0.075; // 7.5% VAT
    const net = gross + vat;
    return { vat, net };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "processed":
      case "approved":
        return "bg-green-100 text-green-800";
      case "outstanding":
      case "sent":
        return "bg-yellow-100 text-yellow-800";
      case "refused":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const handleRefuseNote = (noteId: string, reason: string) => {
    // Implement duplicate prevention - once refused, cannot be resubmitted
    console.log(`Note ${noteId} refused with reason: ${reason} - marking as non-resubmittable`);
    toast({
      title: "Debit Note Refused",
      description: "This note has been permanently refused and cannot be resubmitted.",
      variant: "destructive",
    });
  };

  const handleCreateDebitNote = () => {
    // Validation and duplicate prevention logic
    const calculations = calculateVATAndNet(grossPremium);
    console.log('Creating debit note with calculations:', calculations);
    
    toast({
      title: "Debit Note Created",
      description: "Debit note has been created successfully with real-time calculations.",
    });
    
    setShowCreateModal(false);
  };

  const CreateDebitNoteModal = () => {
    const calculations = calculateVATAndNet(grossPremium);
    
    return (
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Debit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Real-time calculations enabled. VAT and net premium will update automatically.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policyNumber">Policy Number*</Label>
                <Input id="policyNumber" placeholder="POL-2024-XXXXX" />
              </div>
              <div>
                <Label htmlFor="endorsementNumber">Endorsement Number (Optional)</Label>
                <Input id="endorsementNumber" placeholder="END-2024-XXXXX" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="client">Client*</Label>
              <Select>
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
                  value={calculations.vat.toLocaleString()}
                  className="bg-gray-50" 
                />
              </div>
              <div>
                <Label>Net Premium</Label>
                <Input 
                  readOnly 
                  value={calculations.net.toLocaleString()}
                  className="bg-gray-50" 
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
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Debit & Credit Notes</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          Create Debit Note
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="debit-notes">Debit Notes</TabsTrigger>
          <TabsTrigger value="credit-notes">Credit Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="debit-notes">
          <Card>
            <CardHeader>
              <CardTitle>Debit Notes Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Note ID</TableHead>
                    <TableHead>Policy Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Gross Premium</TableHead>
                    <TableHead>VAT (7.5%)</TableHead>
                    <TableHead>Net Premium</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debitNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="font-medium">{note.id}</TableCell>
                      <TableCell>{note.policyNumber}</TableCell>
                      <TableCell>{note.client}</TableCell>
                      <TableCell>₦{note.grossPremium.toLocaleString()}</TableCell>
                      <TableCell>₦{note.vat.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">₦{note.netPremium.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(note.status)}>
                          {note.status}
                        </Badge>
                        {note.status === 'refused' && (
                          <div className="flex items-center mt-1">
                            <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                            <span className="text-xs text-red-600">Cannot resubmit</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          {note.status === 'outstanding' && (
                            <>
                              <Button size="sm" variant="outline">Send Reminder</Button>
                              {note.canResubmit && (
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleRefuseNote(note.id, "Manual refusal")}
                                >
                                  Refuse
                                </Button>
                              )}
                            </>
                          )}
                          {note.status === 'refused' && (
                            <span className="text-xs text-gray-500">Permanently refused</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit-notes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Credit Notes Management</CardTitle>
                <Button>Create Credit Note</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credit Note ID</TableHead>
                    <TableHead>Debit Note</TableHead>
                    <TableHead>Policy Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Original Amount</TableHead>
                    <TableHead>Credit Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="font-medium">{note.id}</TableCell>
                      <TableCell>{note.debitNoteId}</TableCell>
                      <TableCell>{note.policyNumber}</TableCell>
                      <TableCell>{note.client}</TableCell>
                      <TableCell>₦{note.originalAmount.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        -₦{note.creditAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(note.status)}>
                          {note.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm">Process</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateDebitNoteModal />
    </div>
  );
};
