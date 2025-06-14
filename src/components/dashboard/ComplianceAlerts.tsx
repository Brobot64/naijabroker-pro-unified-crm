
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ComplianceAlerts = () => {
  const alerts = [
    {
      id: 1,
      title: "NAICOM Filing Due",
      description: "Monthly return filing due in 3 days",
      priority: "high",
      dueDate: "June 30, 2024"
    },
    {
      id: 2,
      title: "Audit Trail Review",
      description: "Weekly compliance check required",
      priority: "medium",
      dueDate: "June 28, 2024"
    },
    {
      id: 3,
      title: "Policy Document Updates",
      description: "5 policies need regulatory compliance updates",
      priority: "low",
      dueDate: "July 5, 2024"
    },
  ];

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
      </CardContent>
    </Card>
  );
};
