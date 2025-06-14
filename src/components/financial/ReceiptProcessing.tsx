
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface OutstandingDebitNote {
  id: string;
  policyNumber: string;
  client: string;
  netPremium: number;
  outstandingAmount: number;
  dueDate: string;
}

interface Receipt {
  id: string;
  debitNoteId: string;
  policyNumber: string;
  client: string;
  amount: number;
  paymentMethod: string;
  receiptDate: string;
  status: 'pending' | 'cleared' | 'bounced';
  chequeNumber?: string;
  bankName?: string;
}

export const ReceiptProcessing = () => {
  const [activeTab, setActiveTab] = useState("client-receipts");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedDebitNote, setSelectedDebitNote] = useState<OutstandingDebitNote | null>(null);
  const [receiptAmount, setReceiptAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const outstandingDebitNotes: OutstandingDebitNote[] = [
    {
      id: "DN-2024-001",
      policyNumber: "POL-2024-001234",
      client: "Dangote Industries Ltd",
      netPremium: 2875000,
      outstandingAmount: 2875000,
      dueDate: "2024-07-15"
    },
    {
      id: "DN-2024-003",
      policyNumber: "POL-2024-001236",
      client: "First Bank Plc",
      netPremium: 1500000,
      outstandingAmount: 750000, // Partial payment made
      dueDate: "2024-07-20"
    }
  ];

  const clientReceipts: Receipt[] = [
    {
      id: "RCP-2024-001",
      debitNoteId: "DN-2024-002",
      policyNumber: "POL-2024-001235",
      client: "GTBank Plc",
      amount: 5750000,
      paymentMethod: "Bank Transfer",
      receiptDate: "2024-06-18",
      status: "cleared"
    }
  ];

  const insurerReceipts: Receipt[] = [
    {
      id: "RCP-INS-2024-001",
      debitNoteId: "DN-2024-002",
      policyNumber: "POL-2024-001235",
      client: "AXA Mansard Insurance",
      amount: 4600000,
      paymentMethod: "Bank Transfer",
      receiptDate: "2024-06-20",
      status: "cleared"
    }
  ];

  const validatePayment = (amount: number, outstanding: number): boolean => {
    return amount <= outstanding && amount > 0;
  };

  const handleReceiptSubmission = () => {
    const amount = parseFloat(receiptAmount);
    if (!selectedDebitNote || !validatePayment(amount, selectedDebitNote.outstandingAmount)) {
      alert("Invalid payment amount. Cannot exceed outstanding balance.");
      return;
    }

    // Process receipt and generate PDF
    console.log("Processing receipt for:", {
      debitNoteId: selectedDebitNote.id,
      amount,
      paymentMethod
    });

    // Trigger remittance process if full payment
    if (amount === selectedDebitNote.outstandingAmount) {
      console.log("Full payment received - triggering remittance process");
    }

    setShowReceiptModal(false);
    setSelectedDebitNote(null);
    setReceiptAmount("");
  };

  const generateReceiptPDF = (receipt: Receipt) => {
    // Generate branded, exportable PDF
    console.log("Generating PDF for receipt:", receipt.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cleared":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "bounced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const ReceiptModal = () => (
    <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Process Payment Receipt</DialogTitle>
        </DialogHeader>
        {selectedDebitNote && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold">{selectedDebitNote.client}</h4>
              <p className="text-sm text-gray-600">Policy: {selectedDebitNote.policyNumber}</p>
              <p className="text-sm text-gray-600">
                Outstanding: ₦{selectedDebitNote.outstandingAmount.toLocaleString()}
              </p>
            </div>

            <div>
              <Label htmlFor="amount">Payment Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                value={receiptAmount}
                onChange={(e) => setReceiptAmount(e.target.value)}
                max={selectedDebitNote.outstandingAmount}
                placeholder="Enter amount"
              />
              {parseFloat(receiptAmount) > selectedDebitNote.outstandingAmount && (
                <p className="text-red-500 text-sm mt-1">
                  Amount cannot exceed outstanding balance
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "cheque" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chequeNumber">Cheque Number</Label>
                  <Input id="chequeNumber" placeholder="Enter cheque number" />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input id="bankName" placeholder="Enter bank name" />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" placeholder="Additional notes..." />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowReceiptModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleReceiptSubmission}>
                Process Receipt
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Receipt Processing</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="client-receipts">Client Receipts</TabsTrigger>
          <TabsTrigger value="insurer-receipts">Insurer Receipts</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="outstanding">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Debit Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Debit Note ID</TableHead>
                    <TableHead>Policy Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Net Premium</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingDebitNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="font-medium">{note.id}</TableCell>
                      <TableCell>{note.policyNumber}</TableCell>
                      <TableCell>{note.client}</TableCell>
                      <TableCell>₦{note.netPremium.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        ₦{note.outstandingAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{note.dueDate}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedDebitNote(note);
                            setShowReceiptModal(true);
                          }}
                        >
                          Process Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client-receipts">
          <Card>
            <CardHeader>
              <CardTitle>Client Payment Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt ID</TableHead>
                    <TableHead>Policy Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.id}</TableCell>
                      <TableCell>{receipt.policyNumber}</TableCell>
                      <TableCell>{receipt.client}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₦{receipt.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{receipt.paymentMethod}</TableCell>
                      <TableCell>{receipt.receiptDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(receipt.status)}>
                          {receipt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => generateReceiptPDF(receipt)}
                          >
                            PDF
                          </Button>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurer-receipts">
          <Card>
            <CardHeader>
              <CardTitle>Insurer Payment Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt ID</TableHead>
                    <TableHead>Policy Number</TableHead>
                    <TableHead>Insurer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insurerReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.id}</TableCell>
                      <TableCell>{receipt.policyNumber}</TableCell>
                      <TableCell>{receipt.client}</TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        ₦{receipt.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{receipt.paymentMethod}</TableCell>
                      <TableCell>{receipt.receiptDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(receipt.status)}>
                          {receipt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => generateReceiptPDF(receipt)}
                          >
                            PDF
                          </Button>
                          <Button size="sm" variant="outline">View</Button>
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

      <ReceiptModal />
    </div>
  );
};
