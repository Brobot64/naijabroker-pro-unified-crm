
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const StandaloneBroker = () => {
  const [instances, setInstances] = useState([
    {
      id: "INST-001",
      clientName: "Alpha Insurance Brokers",
      deploymentType: "Private Cloud",
      status: "active",
      version: "v2.1.4",
      lastUpdate: "2024-06-10",
      users: 45,
      storage: "2.3 GB"
    },
    {
      id: "INST-002", 
      clientName: "Beta Risk Management",
      deploymentType: "On-Premise",
      status: "active",
      version: "v2.1.3",
      lastUpdate: "2024-06-08",
      users: 28,
      storage: "1.8 GB"
    },
    {
      id: "INST-003",
      clientName: "Gamma Broking Ltd",
      deploymentType: "Private Cloud",
      status: "provisioning",
      version: "v2.1.4",
      lastUpdate: "2024-06-14",
      users: 0,
      storage: "0 GB"
    }
  ]);

  const [newInstance, setNewInstance] = useState({
    clientName: "",
    deploymentType: "private-cloud",
    region: "us-west-2",
    features: [],
    customBranding: true
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "provisioning":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Standalone Broker Deployments</h2>
        <Button>Provision New Instance</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Active Instances</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Provisioning</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Deploy New Instance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input 
                id="clientName"
                value={newInstance.clientName}
                onChange={(e) => setNewInstance({...newInstance, clientName: e.target.value})}
                placeholder="Enter client/company name"
              />
            </div>
            <div>
              <Label htmlFor="deploymentType">Deployment Type</Label>
              <Select value={newInstance.deploymentType} onValueChange={(value) => setNewInstance({...newInstance, deploymentType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private-cloud">Private Cloud</SelectItem>
                  <SelectItem value="on-premise">On-Premise</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="region">Region</Label>
              <Select value={newInstance.region} onValueChange={(value) => setNewInstance({...newInstance, region: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
                  <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                  <SelectItem value="af-south-1">Africa (Cape Town)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customization">Special Requirements</Label>
              <Textarea 
                id="customization"
                placeholder="Custom branding, integrations, compliance requirements..."
                rows={3}
              />
            </div>
            <Button className="w-full">Deploy Instance</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployment Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Standard Broker</h4>
              <p className="text-sm text-gray-600">Basic broker functionality with standard features</p>
              <Badge variant="outline" className="mt-2">Template A</Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Enterprise Broker</h4>
              <p className="text-sm text-gray-600">Full-featured with advanced analytics and compliance</p>
              <Badge variant="outline" className="mt-2">Template B</Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Regional Compliance</h4>
              <p className="text-sm text-gray-600">Configured for specific regulatory requirements</p>
              <Badge variant="outline" className="mt-2">Template C</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Instances</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Deployment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell className="font-medium">{instance.clientName}</TableCell>
                  <TableCell>{instance.deploymentType}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(instance.status)}>{instance.status}</Badge>
                  </TableCell>
                  <TableCell>{instance.version}</TableCell>
                  <TableCell>{instance.users}</TableCell>
                  <TableCell>{instance.storage}</TableCell>
                  <TableCell>{instance.lastUpdate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Manage</Button>
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
