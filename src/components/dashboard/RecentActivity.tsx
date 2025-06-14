
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: "Policy Issued",
      description: "Motor Insurance Policy #MI-2024-001234 issued for Adebayo Motors Ltd",
      timestamp: "2 hours ago",
      status: "completed",
      amount: "₦850,000"
    },
    {
      id: 2,
      type: "Quote Generated",
      description: "Marine Insurance quote for Lagos Port Authority",
      timestamp: "4 hours ago",
      status: "pending",
      amount: "₦2.5M"
    },
    {
      id: 3,
      type: "Payment Received",
      description: "Premium payment received from Zenith Bank Plc",
      timestamp: "6 hours ago",
      status: "completed",
      amount: "₦1.2M"
    },
    {
      id: 4,
      type: "Claim Filed",
      description: "Fire Insurance claim submitted by Manufacturing Co.",
      timestamp: "1 day ago",
      status: "under-review",
      amount: "₦500,000"
    },
    {
      id: 5,
      type: "Renewal Due",
      description: "Property Insurance renewal due for Commercial Plaza",
      timestamp: "2 days ago",
      status: "pending",
      amount: "₦3.1M"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under-review":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">{activity.type}</h4>
                  <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{activity.timestamp}</span>
                  <span className="font-semibold">{activity.amount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
