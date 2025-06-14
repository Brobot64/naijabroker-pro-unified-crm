
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

export const ClaimsManagement = () => {
  const claims = [
    {
      id: "CLM-2024-001",
      policyNumber: "POL-2024-001234",
      client: "Dangote Industries Ltd",
      type: "Fire Damage",
      reportedDate: "2024-06-01",
      claimAmount: "₦5,000,000",
      status: "investigating",
      adjuster: "John Adjuster",
      lastUpdate: "2024-06-10"
    },
    {
      id: "CLM-2024-002",
      policyNumber: "POL-2024-001235",
      client: "GTBank Plc",
      type: "Cyber Security",
      reportedDate: "2024-05-25",
      claimAmount: "₦2,500,000",
      status: "approved",
      adjuster: "Mary Examiner",
      lastUpdate: "2024-06-08"
    },
    {
      id: "CLM-2024-003",
      policyNumber: "POL-2024-001236",
      client: "First Bank Plc",
      type: "Motor Accident",
      reportedDate: "2024-06-05",
      claimAmount: "₦850,000",
      status: "settled",
      adjuster: "David Inspector",
      lastUpdate: "2024-06-12"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "settled":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "investigating":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
        <Button>Register New Claim</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Active Claims</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Under Investigation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦15.8M</div>
            <p className="text-xs text-muted-foreground">Total Claim Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Settlement Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Claims Register</CardTitle>
            <div className="flex space-x-2">
              <Input placeholder="Search claims..." className="w-64" />
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Policy Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Claim Type</TableHead>
                <TableHead>Claim Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Adjuster</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.id}</TableCell>
                  <TableCell>{claim.policyNumber}</TableCell>
                  <TableCell>{claim.client}</TableCell>
                  <TableCell>{claim.type}</TableCell>
                  <TableCell className="font-semibold">{claim.claimAmount}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                  </TableCell>
                  <TableCell>{claim.adjuster}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm">Update Status</Button>
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
