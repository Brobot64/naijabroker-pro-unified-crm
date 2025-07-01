
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export const CriticalAlertsTable = () => {
  const alerts = [
    {
      priority: "critical",
      type: "claims",
      client: "Dangote Cement",
      message: "Claims ratio exceeds 80% threshold",
      status: "unresolved",
      assignedTo: "Folake Adeyemi"
    },
    {
      priority: "high",
      type: "renewal",
      client: "FBN Holdings",
      message: "Major account renewal due in 45 days",
      status: "pending",
      assignedTo: "Emeka Okoro"
    },
    {
      priority: "high",
      type: "fxRisk",
      client: "System",
      message: "Significant Naira depreciation affecting reinsurance",
      status: "pending",
      assignedTo: "Kemi Oluwaseun"
    },
    {
      priority: "medium",
      type: "crossSell",
      client: "MTN Nigeria",
      message: "Cross-sell gap identified at 42%",
      status: "pending",
      assignedTo: "Ibrahim Suleiman"
    },
    {
      priority: "medium",
      type: "marketShare",
      client: "System",
      message: "Market share dropped in Oil & Gas sector",
      status: "monitoring",
      assignedTo: "Grace Nnenna"
    },
  ];

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
        </div>
      </CardContent>
    </Card>
  );
};
