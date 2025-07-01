
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Activity,
  TrendingUp
} from "lucide-react";

interface ActivityItem {
  id: number;
  type: string;
  message: string;
  time: string;
  status: string;
}

export const RecentActivityCard = () => {
  const recentActivities: ActivityItem[] = [
    {
      id: 1,
      type: "policy",
      message: "New Motor Insurance policy created for Dangote Industries",
      time: "2 hours ago",
      status: "completed"
    },
    {
      id: 2,
      type: "claim",
      message: "Fire Insurance claim approved for GTBank Plc",
      time: "4 hours ago",
      status: "approved"
    },
    {
      id: 3,
      type: "workflow",
      message: "Quote approval pending for First Bank Premium",
      time: "6 hours ago",
      status: "pending"
    },
    {
      id: 4,
      type: "renewal",
      message: "Policy renewal reminder sent to Access Bank",
      time: "1 day ago",
      status: "completed"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "policy": return <FileText className="w-4 h-4" />;
      case "claim": return <CheckCircle className="w-4 h-4" />;
      case "workflow": return <Clock className="w-4 h-4" />;
      case "renewal": return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
              {getStatusBadge(activity.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
