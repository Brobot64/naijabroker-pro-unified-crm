
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([
    {
      id: "LOG-001",
      timestamp: "2024-06-14 11:45:23",
      userId: "USR-001",
      userName: "John Smith", 
      action: "USER_LOGIN",
      resource: "Authentication",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome/125.0.0.0",
      status: "success",
      details: "Successful login"
    },
    {
      id: "LOG-002",
      timestamp: "2024-06-14 11:42:15",
      userId: "ADM-001",
      userName: "Sarah Admin",
      action: "SUBSCRIPTION_CREATED",
      resource: "Subscription",
      ipAddress: "10.0.1.50",
      userAgent: "Firefox/126.0",
      status: "success",
      details: "Created premium subscription for client ABC Corp"
    },
    {
      id: "LOG-003", 
      timestamp: "2024-06-14 11:38:07",
      userId: "USR-045",
      userName: "Mike Johnson",
      action: "PAYMENT_FAILED",
      resource: "Payment",
      ipAddress: "203.0.113.45",
      userAgent: "Safari/17.0",
      status: "failed",
      details: "Credit card declined - insufficient funds"
    },
    {
      id: "LOG-004",
      timestamp: "2024-06-14 11:35:12",
      userId: "ADM-002",
      userName: "Dev Team",
      action: "CONFIG_UPDATED",
      resource: "System Configuration",
      ipAddress: "172.16.0.10",
      userAgent: "Chrome/125.0.0.0",
      status: "success", 
      details: "Updated payment gateway settings"
    }
  ]);

  const [filters, setFilters] = useState({
    action: "all",
    status: "all",
    dateRange: "today"
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "USER_LOGIN":
        return "bg-blue-100 text-blue-800";
      case "PAYMENT_FAILED":
        return "bg-red-100 text-red-800";
      case "SUBSCRIPTION_CREATED":
        return "bg-green-100 text-green-800";
      case "CONFIG_UPDATED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Audit Logs & Event Streams</h2>
        <div className="flex space-x-2">
          <Button variant="outline">Export Logs</Button>
          <Button variant="outline">Configure Retention</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select value={filters.action} onValueChange={(value) => setFilters({...filters, action: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="USER_LOGIN">User Login</SelectItem>
                  <SelectItem value="PAYMENT_FAILED">Payment Failed</SelectItem>
                  <SelectItem value="SUBSCRIPTION_CREATED">Subscription Created</SelectItem>
                  <SelectItem value="CONFIG_UPDATED">Config Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrig>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters({...filters, dateRange: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input placeholder="Search logs..." />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground">Total Events Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">Failed Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">1,567</div>
            <p className="text-xs text-muted-foreground">User Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
