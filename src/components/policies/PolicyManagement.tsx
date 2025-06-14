
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

export const PolicyManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const policies = [
    {
      id: "POL-2024-001234",
      client: "Dangote Industries Ltd",
      type: "Industrial All Risks",
      sumInsured: "₦100M",
      premium: "₦2.5M",
      status: "active",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      underwriter: "Lagos Underwriters",
      commission: "₦250,000"
    },
    {
      id: "POL-2024-001235",
      client: "GTBank Plc",
      type: "Bankers Blanket Bond",
      sumInsured: "₦500M",
      premium: "₦5M",
      status: "active",
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      underwriter: "AXA Mansard",
      commission: "₦500,000"
    },
    {
      id: "POL-2024-001236",
      client: "First Bank Plc",
      type: "Motor Fleet",
      sumInsured: "₦25M",
      premium: "₦750,000",
      status: "expired",
      startDate: "2023-06-15",
      endDate: "2024-06-14",
      underwriter: "AIICO Insurance",
      commission: "₦75,000"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Policy Management</h1>
        <Button>Issue New Policy</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2,345</div>
            <p className="text-xs text-muted-foreground">Active Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Expiring This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦450M</div>
            <p className="text-xs text-muted-foreground">Total Sum Insured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦45M</div>
            <p className="text-xs text-muted-foreground">Annual Premium</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Policy Portfolio</CardTitle>
            <div className="flex space-x-2">
              <Input
                placeholder="Search policies..."
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
                <TableHead>Policy Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sum Insured</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.id}</TableCell>
                  <TableCell>{policy.client}</TableCell>
                  <TableCell>{policy.type}</TableCell>
                  <TableCell className="font-semibold">{policy.sumInsured}</TableCell>
                  <TableCell className="font-semibold text-green-600">{policy.premium}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(policy.status)}>{policy.status}</Badge>
                  </TableCell>
                  <TableCell>{policy.endDate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm">Renew</Button>
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
