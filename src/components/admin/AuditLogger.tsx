import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AuditFilters } from "./AuditFilters";
import { AuditLogTable } from "./AuditLogTable";

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
          <AuditFilters
            searchTerm={searchTerm}
            severityFilter={severityFilter}
            actionFilter={actionFilter}
            onSearchChange={setSearchTerm}
            onSeverityChange={setSeverityFilter}
            onActionChange={setActionFilter}
          />
          <AuditLogTable logs={filteredLogs} />
        </CardContent>
      </Card>
    </div>
  );
};
