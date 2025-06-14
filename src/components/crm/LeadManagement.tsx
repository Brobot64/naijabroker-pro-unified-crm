
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

export const LeadManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const leads = [
    {
      id: "LD-001",
      name: "Dangote Industries Ltd",
      contact: "Aliko Dangote",
      email: "info@dangote.com",
      phone: "+234-1-448-0815",
      type: "Industrial Risk",
      status: "hot",
      value: "₦50M",
      lastContact: "2024-06-10",
      agent: "John Smith"
    },
    {
      id: "LD-002",
      name: "GTBank Plc",
      contact: "Segun Agbaje",
      email: "corporate@gtbank.com",
      phone: "+234-1-448-5500",
      type: "Financial Lines",
      status: "warm",
      value: "₦25M",
      lastContact: "2024-06-08",
      agent: "Mary Johnson"
    },
    {
      id: "LD-003",
      name: "Shoprite Holdings",
      contact: "Jane Doe",
      email: "insurance@shoprite.ng",
      phone: "+234-1-271-9300",
      type: "Commercial Property",
      status: "cold",
      value: "₦15M",
      lastContact: "2024-06-05",
      agent: "David Wilson"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot":
        return "bg-red-100 text-red-800";
      case "warm":
        return "bg-yellow-100 text-yellow-800";
      case "cold":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
        <Button>Add New Lead</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lead Pipeline</CardTitle>
            <div className="flex space-x-2">
              <Input
                placeholder="Search leads..."
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
                <TableHead>Lead ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Potential Value</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{lead.name}</p>
                      <p className="text-sm text-gray-500">{lead.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lead.contact}</p>
                      <p className="text-sm text-gray-500">{lead.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{lead.type}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{lead.value}</TableCell>
                  <TableCell>{lead.agent}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm">Generate Quote</Button>
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
