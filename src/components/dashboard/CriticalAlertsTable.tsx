
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { PolicyService } from "@/services/database/policyService";
import { ClaimService } from "@/services/database/claimService";
import { QuoteService } from "@/services/database/quoteService";

interface CriticalAlert {
  priority: "critical" | "high" | "medium";
  type: string;
  client: string;
  message: string;
  status: "unresolved" | "pending" | "monitoring";
  assignedTo: string;
}

export const CriticalAlertsTable = () => {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCriticalAlerts();
  }, []);

  const loadCriticalAlerts = async () => {
    try {
      const [policies, claims, quotes] = await Promise.all([
        PolicyService.getAll(),
        ClaimService.getAll(),
        QuoteService.getAll()
      ]);

      const generatedAlerts: CriticalAlert[] = [];
      const today = new Date();

      // Check for high claims ratios per client
      const clientClaimsRatio = claims.reduce((acc, claim) => {
        const clientName = claim.client_name;
        if (!acc[clientName]) {
          acc[clientName] = { claims: 0, premium: 0 };
        }
        if (claim.status === 'settled') {
          acc[clientName].claims += Number(claim.settlement_amount || 0);
        }
        return acc;
      }, {} as Record<string, any>);

      policies.forEach(policy => {
        if (policy.status === 'active') {
          const clientName = policy.client_name;
          if (clientClaimsRatio[clientName]) {
            clientClaimsRatio[clientName].premium += Number(policy.premium || 0);
          }
        }
      });

      Object.entries(clientClaimsRatio).forEach(([client, data]) => {
        if (data.premium > 0) {
          const ratio = (data.claims / data.premium) * 100;
          if (ratio > 70) {
            generatedAlerts.push({
              priority: ratio > 90 ? "critical" : "high",
              type: "claims",
              client,
              message: `Claims ratio at ${ratio.toFixed(1)}% exceeds threshold`,
              status: "unresolved",
              assignedTo: "Risk Manager"
            });
          }
        }
      });

      // Check for major renewals due soon
      const renewalsIn45Days = policies.filter(policy => {
        if (policy.status !== 'active') return false;
        const renewalDate = new Date(policy.end_date);
        const daysToRenewal = (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return daysToRenewal <= 45 && daysToRenewal > 0 && Number(policy.premium) > 50000000; // Major accounts > 50M
      });

      renewalsIn45Days.forEach(policy => {
        const daysToRenewal = Math.ceil((new Date(policy.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        generatedAlerts.push({
          priority: daysToRenewal <= 15 ? "high" : "medium",
          type: "renewal",
          client: policy.client_name,
          message: `Major account renewal due in ${daysToRenewal} days`,
          status: "pending",
          assignedTo: "Account Manager"
        });
      });

      // Check for stalled quotes in important stages
      const stalledQuotes = quotes.filter(quote => {
        const lastUpdate = new Date(quote.updated_at);
        const daysSinceUpdate = (today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 7 && ['quote-evaluation', 'client-selection'].includes(quote.workflow_stage || '');
      });

      if (stalledQuotes.length > 3) {
        generatedAlerts.push({
          priority: "medium",
          type: "workflow",
          client: "System",
          message: `${stalledQuotes.length} quotes stalled in evaluation phase`,
          status: "monitoring",
          assignedTo: "Operations Manager"
        });
      }

      // Add market alerts (simulated)
      const highValuePolicies = policies.filter(p => p.status === 'active' && Number(p.premium) > 100000000);
      if (highValuePolicies.length > 0) {
        generatedAlerts.push({
          priority: "medium",
          type: "fxRisk",
          client: "System",
          message: "Naira volatility affecting reinsurance costs",
          status: "monitoring",
          assignedTo: "Treasury Team"
        });
      }

      setAlerts(generatedAlerts.slice(0, 8)); // Limit to 8 alerts
    } catch (error) {
      console.error('Error loading critical alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unresolved':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'monitoring':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <span>Critical Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-gray-500">Loading critical alerts...</span>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-green-600">✅ No critical alerts at this time</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Priority</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Type</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Client</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Message</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-gray-700 capitalize">{alert.type}</td>
                    <td className="py-3 px-2 font-medium text-gray-900">{alert.client}</td>
                    <td className="py-3 px-2 text-gray-700 text-sm">{alert.message}</td>
                    <td className="py-3 px-2">
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-gray-700 text-sm">{alert.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
