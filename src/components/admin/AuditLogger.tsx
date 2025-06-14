
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Filter, Download } from "lucide-react";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const AuditLogger = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  // Mock audit log data
  useEffect(() => {
    const mockLogs: AuditLogEntry[] = [
      {
        id: 'log-001',
        timestamp: '2024-06-14 10:30:15',
        userId: 'admin-001',
        userName: 'John Developer',
        action: 'USER_CREATED',
        resource: 'User Management',
        details: 'Created new user: sarah.brown@naijabroker.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'medium'
      },
      {
        id: 'log-002',
        timestamp: '2024-06-14 10:25:30',
        userId: 'admin-001',
        userName: 'John Developer',
        action: 'SECURITY_SETTINGS_UPDATED',
        resource: 'System Configuration',
        details: 'Updated MFA requirement to mandatory',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'high'
      },
      {
        id: 'log-003',
        timestamp: '2024-06-14 10:20:45',
        userId: 'admin-002',
        userName: 'Sarah SysAdmin',
        action: 'USER_PERMISSIONS_UPDATED',
        resource: 'User Management',
        details: 'Updated permissions for user: mike.support@naijabroker.dev',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7)',
        severity: 'medium'
      },
      {
        id: 'log-004',
        timestamp: '2024-06-14 10:15:20',
        userId: 'admin-001',
        userName: 'John Developer',
        action: 'LOGIN_FAILED',
        resource: 'Authentication',
        details: 'Failed login attempt from IP: 10.0.0.50',
        ipAddress: '10.0.0.50',
        userAgent: 'Mozilla/5.0 (Unknown)',
        severity: 'critical'
      },
      {
        id: 'log-005',
        timestamp: '2024-06-14 10:10:10',
        userId: 'admin-003',
        userName: 'Mike Support',
        action: 'POLICY_CREATED',
        resource: 'Policy Management',
        details: 'Created new policy: AUTO-2024-001',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'low'
      }
    ];
    
    setAuditLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  // Filter logs based on search and filters
  useEffect(() => {
    let filtered = auditLogs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action.includes(actionFilter));
    }

    setFilteredLogs(filtered);
  }, [auditLogs, searchTerm, severityFilter, actionFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      'Timestamp,User,Action,Resource,Details,IP Address,Severity',
      ...filteredLogs.map(log => 
        `"${log.timestamp}","${log.userName}","${log.action}","${log.resource}","${log.details}","${log.ipAddress}","${log.severity}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Logs</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportLogs}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="USER">User Actions</SelectItem>
                <SelectItem value="SECURITY">Security Actions</SelectItem>
                <SelectItem value="LOGIN">Login Actions</SelectItem>
                <SelectItem value="POLICY">Policy Actions</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(log.severity)}>
                      {log.severity}
                    </Badge>
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
