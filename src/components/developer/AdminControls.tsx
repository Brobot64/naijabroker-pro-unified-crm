
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SecuritySettingsPanel } from "../admin/SecuritySettingsPanel";
import { AdminUsersList } from "../admin/AdminUsersList";
import { AuditLogger } from "../admin/AuditLogger";
import { AdminMetrics } from "../admin/AdminMetrics";
import { InsurerManagement } from "../admin/InsurerManagement";

export const AdminControls = () => {
  const [showAuditLogs, setShowAuditLogs] = useState(false);

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

      <AdminMetrics metrics={metrics} />

      {showAuditLogs && <AuditLogger />}

      <SecuritySettingsPanel />
      
      <AdminUsersList />

      <InsurerManagement />
    </div>
  );
};
