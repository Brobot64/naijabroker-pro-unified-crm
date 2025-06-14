
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState([
    {
      id: "CAM-001",
      name: "Q2 Feature Announcement",
      type: "email",
      status: "active",
      recipients: 2847,
      sent: 2847,
      opened: 1523,
      clicked: 234,
      scheduled: "2024-06-15 09:00"
    },
    {
      id: "CAM-002",
      name: "Renewal Reminder Series",
      type: "email",
      status: "scheduled",
      recipients: 567,
      sent: 0,
      opened: 0,
      clicked: 0,
      scheduled: "2024-06-20 10:00"
    },
    {
      id: "CAM-003",
      name: "Premium Plan Promotion",
      type: "sms",
      status: "completed",
      recipients: 1234,
      sent: 1234,
      opened: 956,
      clicked: 89,
      scheduled: "2024-06-10 14:00"
    }
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "email",
    subject: "",
    content: "",
    audience: "all-subscribers"
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateRate = (numerator: number, denominator: number) => {
    return denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : "0.0";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Campaign & Marketing System</h2>
        <Button>Create Campaign</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active Campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">89.4K</div>
            <p className="text-xs text-muted-foreground">Total Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">34.2%</div>
            <p className="text-xs text-muted-foreground">Avg Open Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">5.8%</div>
            <p className="text-xs text-muted-foreground">Avg Click Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input 
                id="campaignName"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                placeholder="Enter campaign name"
              />
            </div>
            <div>
              <Label htmlFor="campaignType">Campaign Type</Label>
              <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign({...newCampaign, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="sms">SMS Campaign</SelectItem>
                  <SelectItem value="push">Push Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="audience">Target Audience</Label>
              <Select value={newCampaign.audience} onValueChange={(value) => setNewCampaign({...newCampaign, audience: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-subscribers">All Subscribers</SelectItem>
                  <SelectItem value="trial-users">Trial Users</SelectItem>
                  <SelectItem value="premium-users">Premium Users</SelectItem>
                  <SelectItem value="inactive-users">Inactive Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject Line</Label>
              <Input 
                id="subject"
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                placeholder="Enter subject line"
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea 
                id="content"
                value={newCampaign.content}
                onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                placeholder="Enter campaign content..."
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button className="flex-1">Save Draft</Button>
              <Button className="flex-1">Schedule</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Welcome Series</h4>
              <p className="text-sm text-gray-600">Multi-step onboarding campaign</p>
              <Badge variant="outline" className="mt-2">Email Template</Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Feature Announcement</h4>
              <p className="text-sm text-gray-600">Product update notifications</p>
              <Badge variant="outline" className="mt-2">Email Template</Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Renewal Reminder</h4>
              <p className="text-sm text-gray-600">Subscription renewal alerts</p>
              <Badge variant="outline" className="mt-2">Email + SMS</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Click Rate</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell className="capitalize">{campaign.type}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                  </TableCell>
                  <TableCell>{campaign.recipients.toLocaleString()}</TableCell>
                  <TableCell>{calculateRate(campaign.opened, campaign.sent)}%</TableCell>
                  <TableCell>{calculateRate(campaign.clicked, campaign.opened)}%</TableCell>
                  <TableCell>{campaign.scheduled}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Analytics</Button>
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
