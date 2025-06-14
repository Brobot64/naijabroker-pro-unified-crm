
import { Card, CardContent } from "@/components/ui/card";

interface AdminMetricsProps {
  metrics: {
    totalAdminUsers: number;
    activeUsers: number;
    securityAlerts: number;
    lastAuditEvent: string;
  };
}

export const AdminMetrics = ({ metrics }: AdminMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{metrics.totalAdminUsers}</div>
          <p className="text-xs text-muted-foreground">Admin Users</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{metrics.activeUsers}</div>
          <p className="text-xs text-muted-foreground">Active Now</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{metrics.securityAlerts}</div>
          <p className="text-xs text-muted-foreground">Security Alerts</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{metrics.lastAuditEvent}</div>
          <p className="text-xs text-muted-foreground">Last Audit Event</p>
        </CardContent>
      </Card>
    </div>
  );
};
