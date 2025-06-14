
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

interface AuditLogTableProps {
  logs: AuditLogEntry[];
}

export const AuditLogTable = ({ logs }: AuditLogTableProps) => {
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

  return (
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
        {logs.map((log) => (
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
  );
};
