
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PolicyService } from "@/services/database/policyService";
import { QuoteService } from "@/services/database/quoteService";

interface ComplianceAlert {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
}

export const ComplianceAlerts = () => {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceAlerts();
  }, []);

  const loadComplianceAlerts = async () => {
    try {
      const [policies, quotes] = await Promise.all([
        PolicyService.getAll(),
        QuoteService.getAll()
      ]);

      const generatedAlerts: ComplianceAlert[] = [];
      const today = new Date();

      // Check for NAICOM filing (monthly)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const daysToMonthEnd = Math.ceil((monthEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToMonthEnd <= 5) {
        generatedAlerts.push({
          id: "naicom-filing",
          title: "NAICOM Filing Due",
          description: `Monthly return filing due in ${daysToMonthEnd} days`,
          priority: daysToMonthEnd <= 2 ? "high" : "medium",
          dueDate: monthEnd.toLocaleDateString('en-GB')
        });
      }

      // Check for policies without proper documentation
      const policiesWithoutDocs = policies.filter(p => 
        p.status === 'active' && (!p.terms_conditions || p.terms_conditions.trim() === '')
      );
      
      if (policiesWithoutDocs.length > 0) {
        generatedAlerts.push({
          id: "policy-docs",
          title: "Policy Document Updates",
          description: `${policiesWithoutDocs.length} policies need regulatory compliance updates`,
          priority: policiesWithoutDocs.length > 10 ? "high" : "medium",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')
        });
      }

      // Check for overdue quotes (older than 30 days without progression)
      const overdueQuotes = quotes.filter(q => {
        const createdDate = new Date(q.created_at);
        const daysSinceCreated = (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return q.status === 'draft' && daysSinceCreated > 30;
      });

      if (overdueQuotes.length > 0) {
        generatedAlerts.push({
          id: "overdue-quotes",
          title: "Overdue Quote Review",
          description: `${overdueQuotes.length} quotes pending review for over 30 days`,
          priority: "medium",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')
        });
      }

      // Weekly audit trail review
      const dayOfWeek = today.getDay();
      if (dayOfWeek === 1) { // Monday
        generatedAlerts.push({
          id: "audit-review",
          title: "Audit Trail Review",
          description: "Weekly compliance check required",
          priority: "low",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')
        });
      }

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Error loading compliance alerts:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-500">Loading compliance alerts...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-green-600">✅ All compliance requirements up to date</span>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <Badge className={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                <p className="text-xs text-gray-500">Due: {alert.dueDate}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
