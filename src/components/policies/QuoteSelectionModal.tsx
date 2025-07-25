import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { QuoteService } from "@/services/database/quoteService";
import { useAuth } from "@/contexts/AuthContext";
import { Search, FileText, User, DollarSign } from "lucide-react";

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  underwriter: string;
  policy_type: string;
  sum_insured: number;
  premium: number;
  commission_rate: number;
  final_contract_url?: string;
  terms_conditions?: string;
  notes?: string;
  valid_until: string;
  status: string;
  workflow_stage: string;
}

interface QuoteSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuoteSelected: (quote: Quote) => void;
  onPolicyCreated?: () => void;
}

export const QuoteSelectionModal = ({ open, onOpenChange, onQuoteSelected, onPolicyCreated }: QuoteSelectionModalProps) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { organizationId } = useAuth();

  useEffect(() => {
    if (open && organizationId) {
      loadFinalizedQuotes();
    }
  }, [open, organizationId]);

  // Refresh quotes when a policy is created
  useEffect(() => {
    if (onPolicyCreated && open && organizationId) {
      loadFinalizedQuotes();
    }
  }, [onPolicyCreated, open, organizationId]);

  const loadFinalizedQuotes = async () => {
    setLoading(true);
    try {
      const data = await QuoteService.getFinalizedQuotesForPolicy(organizationId);
      setQuotes(data);
    } catch (error) {
      console.error('Failed to load finalized quotes:', error);
      toast({
        title: "Error",
        description: "Failed to load finalized quotes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSelect = (quote: Quote) => {
    onQuoteSelected(quote);
    onOpenChange(false);
  };

  const filteredQuotes = quotes.filter(quote => 
    quote.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.policy_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Quote to Convert to Policy</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotes by client, quote number, or policy type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {filteredQuotes.length} finalized quotes
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p>Loading finalized quotes...</p>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No valid quotes available</h3>
                <p className="text-muted-foreground">
                  Only quotes with finalized contracts, valid premium amounts, and complete data that haven't been converted to policies can be selected.
                </p>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Quotes with ₦0 premium, missing underwriter information, or incomplete data are filtered out.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Policy Type</TableHead>
                    <TableHead>Sum Insured</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Underwriter</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.quote_number}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{quote.client_name}</div>
                          {quote.client_email && (
                            <div className="text-sm text-muted-foreground">{quote.client_email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{quote.policy_type}</TableCell>
                      <TableCell className="font-semibold">₦{quote.sum_insured.toLocaleString()}</TableCell>
                       <TableCell className="font-semibold text-green-600">
                         {quote.premium > 0 ? `₦${quote.premium.toLocaleString()}` : (
                           <span className="text-red-500">₦0 (Invalid)</span>
                         )}
                       </TableCell>
                      <TableCell>{quote.underwriter}</TableCell>
                      <TableCell>{quote.valid_until}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={quote.workflow_stage === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {quote.workflow_stage === 'completed' ? 'Finalized' : quote.workflow_stage}
                          </Badge>
                           <Button 
                             size="sm"
                             onClick={() => handleQuoteSelect(quote)}
                             className="flex items-center gap-1"
                             disabled={
                               !quote.final_contract_url || 
                               quote.workflow_stage !== 'completed' ||
                               quote.premium <= 0 ||
                               quote.sum_insured <= 0 ||
                               !quote.underwriter ||
                               quote.underwriter === 'TBD'
                             }
                           >
                             <FileText className="h-3 w-3" />
                             {quote.premium <= 0 || quote.underwriter === 'TBD' ? 'Invalid Data' : 'Select'}
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};