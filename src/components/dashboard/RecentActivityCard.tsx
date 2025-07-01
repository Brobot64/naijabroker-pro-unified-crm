
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: string;
  user: string;
}

export const RecentActivityCard = () => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'Policy',
      description: 'New policy POL-2024-001234 created for Dangote Industries Ltd',
      timestamp: '2 hours ago',
      status: 'completed',
      user: 'Adebayo Ogundimu'
    },
    {
      id: '2',
      type: 'Claim',
      description: 'Claim CL-2024-005678 registered for GTBank Motor Policy',
      timestamp: '4 hours ago',
      status: 'pending',
      user: 'Chioma Nwankwo'
    },
    {
      id: '3',
      type: 'Quote',
      description: 'Quote QT-2024-003456 generated for Lagos State Government',
      timestamp: '6 hours ago',
      status: 'sent',
      user: 'Yakubu Mohammed'
    },
    {
      id: '4',
      type: 'Payment',
      description: 'Premium payment received for POL-2024-001200',
      timestamp: '1 day ago',
      status: 'completed',
      user: 'System'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Policy':
        return 'bg-purple-100 text-purple-800';
      case 'Claim':
        return 'bg-red-100 text-red-800';
      case 'Quote':
        return 'bg-blue-100 text-blue-800';
      case 'Payment':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0">
                <Badge className={getTypeColor(activity.type)}>
                  {activity.type}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    by {activity.user} • {activity.timestamp}
                  </p>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
