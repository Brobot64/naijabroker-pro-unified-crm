
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const CustomerSupport = () => {
  const [tickets, setTickets] = useState([
    {
      id: "TKT-001",
      title: "Payment Gateway Issue",
      customer: "ABC Insurance Co",
      priority: "high",
      status: "open",
      assignee: "John Support",
      created: "2024-06-14 10:30",
      slaStatus: "within-sla"
    },
    {
      id: "TKT-002", 
      title: "Policy Export Problem",
      customer: "XYZ Brokers Ltd",
      priority: "medium",
      status: "in-progress",
      assignee: "Sarah Help",
      created: "2024-06-14 09:15",
      slaStatus: "within-sla"
    },
    {
      id: "TKT-003",
      title: "User Login Issues",
      customer: "Global Risk Management",
      priority: "low",
      status: "pending",
      assignee: "Mike Assist",
      created: "2024-06-13 16:45",
      slaStatus: "approaching-breach"
    }
  ]);

  const [knowledgeBase, setKnowledgeBase] = useState([
    {
      id: "KB-001",
      title: "How to Set Up Payment Gateways",
      category: "Integration",
      views: 245,
      lastUpdated: "2024-06-10",
      status: "published"
    },
    {
      id: "KB-002",
      title: "User Role Management Guide", 
      category: "Administration",
      views: 189,
      lastUpdated: "2024-06-08",
      status: "published"
    },
    {
      id: "KB-003",
      title: "Troubleshooting Login Issues",
      category: "Support",
      views: 156,
      lastUpdated: "2024-06-12",
      status: "draft"
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSlaColor = (slaStatus: string) => {
    switch (slaStatus) {
      case "within-sla":
        return "bg-green-100 text-green-800";
      case "approaching-breach":
        return "bg-yellow-100 text-yellow-800";
      case "breached":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Customer Support Hub</h2>
        <div className="flex space-x-2">
          <Button variant="outline">AI Support Config</Button>
          <Button>Create Ticket</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">43</div>
            <p className="text-xs text-muted-foreground">Open Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2.3h</div>
            <p className="text-xs text-muted-foreground">Avg Response Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">SLA Compliance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">4.8/5</div>
            <p className="text-xs text-muted-foreground">Customer Satisfaction</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="ai-support">AI Support</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Support Tickets</CardTitle>
                <div className="flex space-x-2">
                  <Input placeholder="Search tickets..." className="w-64" />
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>{ticket.customer}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                      </TableCell>
                      <TableCell>{ticket.assignee}</TableCell>
                      <TableCell>
                        <Badge className={getSlaColor(ticket.slaStatus)}>
                          {ticket.slaStatus.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">Update</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Knowledge Base Management</CardTitle>
                <Button>Create Article</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {knowledgeBase.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>{article.category}</TableCell>
                      <TableCell>{article.views}</TableCell>
                      <TableCell>{article.lastUpdated}</TableCell>
                      <TableCell>
                        <Badge className={article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {article.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Publish</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-support">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Support Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="aiModel">AI Model</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="claude">Claude</SelectItem>
                      <SelectItem value="gemini">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="autoResponse">Auto-Response Threshold</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Confidence Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (90%+)</SelectItem>
                      <SelectItem value="medium">Medium (70%+)</SelectItem>
                      <SelectItem value="low">Low (50%+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="escalation">Escalation Rules</Label>
                  <Textarea 
                    id="escalation"
                    placeholder="Define when to escalate to human agents..."
                    rows={3}
                  />
                </div>
                <Button className="w-full">Update AI Configuration</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">89.3%</div>
                    <p className="text-sm text-gray-600">Resolution Rate</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">1.2m</div>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">4.6/5</div>
                    <p className="text-sm text-gray-600">User Satisfaction</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">67%</div>
                    <p className="text-sm text-gray-600">Deflection Rate</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">View Detailed Analytics</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
