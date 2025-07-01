
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Eye, Edit, Trash2 } from "lucide-react";

export const QuoteList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - this would come from your database
  const quotes = [
    {
      id: "QT-2024-001",
      client: "Dangote Industries Ltd",
      type: "Industrial All Risks",
      sumInsured: "₦100M",
      premium: "₦2.5M",
      status: "draft",
      validUntil: "2024-07-15",
      agent: "John Smith",
      underwriter: "Lagos Underwriters",
      stage: "quote-drafting"
    },
    {
      id: "QT-2024-002",
      client: "GTBank Plc",
      type: "Bankers Blanket Bond",
      sumInsured: "₦500M",
      premium: "₦5M",
      status: "sent",
      validUntil: "2024-07-20",
      agent: "Mary Johnson",
      underwriter: "AXA Mansard",
      stage: "client-selection"
    },
    {
      id: "QT-2024-003",
      client: "Shoprite Holdings",
      type: "Commercial Property",
      sumInsured: "₦75M",
      premium: "₦1.8M",
      status: "accepted",
      validUntil: "2024-06-10",
      agent: "David Wilson",
      underwriter: "AIICO Insurance",
      stage: "payment-processing"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "quote-drafting":
        return "bg-orange-100 text-orange-800";
      case "client-selection":
        return "bg-blue-100 text-blue-800";
      case "payment-processing":
        return "bg-purple-100 text-purple-800";
      case "contract-generation":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quote Pipeline</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search quotes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Insurance Type</TableHead>
                <TableHead>Sum Insured</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.id}</TableCell>
                  <TableCell>{quote.client}</TableCell>
                  <TableCell>{quote.type}</TableCell>
                  <TableCell className="font-semibold">{quote.sumInsured}</TableCell>
                  <TableCell className="font-semibold text-green-600">{quote.premium}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quote.status)}>{quote.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStageColor(quote.stage)}>
                      {quote.stage.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{quote.validUntil}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
