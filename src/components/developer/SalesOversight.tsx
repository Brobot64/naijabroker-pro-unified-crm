
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export const SalesOversight = () => {
  const [salesData, setSalesData] = useState([
    {
      id: "REP-001",
      name: "Alice Johnson",
      territory: "West Africa",
      leads: 45,
      opportunities: 12,
      closedDeals: 8,
      revenue: 125000,
      commission: 12500,
      target: 150000
    },
    {
      id: "REP-002", 
      name: "David Williams",
      territory: "East Africa",
      leads: 38,
      opportunities: 15,
      closedDeals: 6,
      revenue: 89000,
      commission: 8900,
      target: 120000
    },
    {
      id: "REP-003",
      name: "Sarah Brown",
      territory: "Central Africa",
      leads: 52,
      opportunities: 18,
      closedDeals: 11,
      revenue: 167000,
      commission: 16700,
      target: 180000
    }
  ]);

  const [pipeline, setPipeline] = useState([
    {
      id: "OPP-001",
      company: "TechCorp Industries",
      value: 25000,
      stage: "negotiation",
      probability: 75,
      closeDate: "2024-06-30",
      salesRep: "Alice Johnson"
    },
    {
      id: "OPP-002",
      company: "Global Manufacturing",
      value: 45000,
      stage: "proposal",
      probability: 60,
      closeDate: "2024-07-15",
      salesRep: "David Williams"
    },
    {
      id: "OPP-003",
      company: "StartupX Ltd",
      value: 15000,
      stage: "qualified",
      probability: 40,
      closeDate: "2024-07-20",
      salesRep: "Sarah Brown"
    }
  ]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "qualified":
        return "bg-blue-100 text-blue-800";
      case "proposal":
        return "bg-yellow-100 text-yellow-800";
      case "negotiation":
        return "bg-orange-100 text-orange-800";
      case "closed-won":
        return "bg-green-100 text-green-800";
      case "closed-lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (revenue: number, target: number) => {
    return Math.min((revenue / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Sales & Distribution Oversight</h2>
        <div className="flex space-x-2">
          <Button variant="outline">Export Report</Button>
          <Button>Add Opportunity</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦381K</div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Active Opportunities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦38.1K</div>
            <p className="text-xs text-muted-foreground">Total Commissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">84.7%</div>
            <p className="text-xs text-muted-foreground">Target Achievement</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Opportunities</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Target Progress</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((rep) => (
                <TableRow key={rep.id}>
                  <TableCell className="font-medium">{rep.name}</TableCell>
                  <TableCell>{rep.territory}</TableCell>
                  <TableCell>{rep.leads}</TableCell>
                  <TableCell>{rep.opportunities}</TableCell>
                  <TableCell>₦{rep.revenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={calculateProgress(rep.revenue, rep.target)} className="w-20" />
                      <span className="text-xs text-gray-500">
                        {calculateProgress(rep.revenue, rep.target).toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>₦{rep.commission.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipeline.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-medium">{opportunity.company}</TableCell>
                  <TableCell>₦{opportunity.value.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStageColor(opportunity.stage)}>{opportunity.stage}</Badge>
                  </TableCell>
                  <TableCell>{opportunity.probability}%</TableCell>
                  <TableCell>{opportunity.closeDate}</TableCell>
                  <TableCell>{opportunity.salesRep}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Update</Button>
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
