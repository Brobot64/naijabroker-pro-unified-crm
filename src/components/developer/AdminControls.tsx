
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SecuritySettingsPanel } from "../admin/SecuritySettingsPanel";
import { AdminUsersList } from "../admin/AdminUsersList";
import { AuditLogger } from "../admin/AuditLogger";
import { useToast } from "@/hooks/use-toast";

export const AdminControls = () => {
  const { toast } = useToast();
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  // Mock data for overview metrics
  const metrics = {
    totalAdminUsers: 3,
    activeUsers: 2,
    securityAlerts: 0,
    lastAuditEvent: "2 minutes ago"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Admin Controls & Security</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowAuditLogs(!showAuditLogs)}>
            {showAuditLogs ? 'Hide' : 'View'} Audit Logs
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
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

      {showAuditLogs && <AuditLogger />}

      <SecuritySettingsPanel />
      
      <AdminUsersList />
    </div>
  );
};
