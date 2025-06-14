
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
import { financialCalculator } from "@/utils/financialCalculations";
import { workflowManager } from "@/utils/workflowManager";

interface DebitNote {
  id: string;
  policyNumber: string;
  endorsementNumber?: string;
  client: string;
  grossPremium: number;
  vat: number;
  netPremium: number;
  status: 'draft' | 'sent' | 'outstanding' | 'paid' | 'refused';
  createdDate: string;
  dueDate: string;
  coBrokers?: string[];
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
}

export const DebitCreditNotes = () => {
  const [activeTab, setActiveTab] = useState("debit-notes");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DebitNote | null>(null);

  const debitNotes: DebitNote[] = [
    {
      id: "DN-2024-001",
      policyNumber: "POL-2024-001234",
      client: "Dangote Industries Ltd",
      grossPremium: 2500000,
      vat: 375000,
      netPremium: 2875000,
      status: "outstanding",
      createdDate: "2024-06-01",
      dueDate: "2024-07-01"
    },
    {
      id: "DN-2024-002",
      policyNumber: "POL-2024-001235",
      client: "GTBank Plc",
      grossPremium: 5000000,
      vat: 750000,
      netPremium: 5750000,
      status: "paid",
      createdDate: "2024-05-15",
      dueDate: "2024-06-15"
    }
  ];

  const creditNotes: CreditNote[] = [
    {
      id: "CN-2024-001",
      debitNoteId: "DN-2024-001",
      policyNumber: "POL-2024-001234",
      client: "Dangote Industries Ltd",
      originalAmount: 2875000,
      creditAmount: 287500,
      reason: "Premium adjustment due to risk reassessment",
      status: "approved",
      createdDate: "2024-06-10"
    }
  ];

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
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const handleRefuseNote = (noteId: string) => {
    // Implement duplicate prevention - once refused, cannot be resubmitted
    console.log(`Note ${noteId} refused - marking as non-resubmittable`);
  };

  const CreateDebitNoteModal = () => (
    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Debit Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="policyNumber">Policy Number</Label>
              <Input id="policyNumber" placeholder="POL-2024-XXXXX" />
            </div>
            <div>
              <Label htmlFor="endorsementNumber">Endorsement Number (Optional)</Label>
              <Input id="endorsementNumber" placeholder="END-2024-XXXXX" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="client">Client</Label>
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
              <Label htmlFor="grossPremium">Gross Premium (₦)</Label>
              <Input id="grossPremium" type="number" placeholder="0.00" />
            </div>
            <div>
              <Label>VAT (15%)</Label>
              <Input readOnly placeholder="Auto-calculated" className="bg-gray-50" />
            </div>
            <div>
              <Label>Net Premium</Label>
              <Input readOnly placeholder="Auto-calculated" className="bg-gray-50" />
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
            <Button>Create Debit Note</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

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
                    <TableHead>VAT</TableHead>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          {note.status === 'outstanding' && (
                            <>
                              <Button size="sm" variant="outline">Send Reminder</Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRefuseNote(note.id)}
                              >
                                Refuse
                              </Button>
                            </>
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
