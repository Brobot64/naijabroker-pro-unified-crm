
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

export const QuoteManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const quotes = [
    {
      id: "QT-2024-001",
      client: "Dangote Industries Ltd",
      type: "Industrial All Risks",
      sumInsured: "₦100M",
      premium: "₦2.5M",
      status: "pending",
      validUntil: "2024-07-15",
      agent: "John Smith",
      underwriter: "Lagos Underwriters"
    },
    {
      id: "QT-2024-002",
      client: "GTBank Plc",
      type: "Bankers Blanket Bond",
      sumInsured: "₦500M",
      premium: "₦5M",
      status: "approved",
      validUntil: "2024-07-20",
      agent: "Mary Johnson",
      underwriter: "AXA Mansard"
    },
    {
      id: "QT-2024-003",
      client: "Shoprite Holdings",
      type: "Commercial Property",
      sumInsured: "₦75M",
      premium: "₦1.8M",
      status: "expired",
      validUntil: "2024-06-10",
      agent: "David Wilson",
      underwriter: "AIICO Insurance"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quote Management</h1>
        <Button>Create New Quote</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Total Quotes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Converted to Policy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦125M</div>
            <p className="text-xs text-muted-foreground">Total Premium Value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quote Pipeline</CardTitle>
            <div className="flex space-x-2">
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button variant="outline">Filter</Button>
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
                  <TableCell>{quote.validUntil}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm">Convert to Policy</Button>
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
