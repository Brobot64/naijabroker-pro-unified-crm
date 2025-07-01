
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, MessageCircle, Heart } from "lucide-react";

interface SocialMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

export const SocialMetrics = () => {
  const metrics: SocialMetric[] = [
    {
      title: "Total Followers",
      value: "24.5K",
      change: "+12.5%",
      trend: "up",
      icon: <Users className="w-4 h-4" />
    },
    {
      title: "Engagement Rate",
      value: "4.2%",
      change: "+0.8%",
      trend: "up",
      icon: <Heart className="w-4 h-4" />
    },
    {
      title: "Monthly Reach",
      value: "128K",
      change: "+24.1%",
      trend: "up",
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      title: "Comments",
      value: "1.2K",
      change: "-5.2%",
      trend: "down",
      icon: <MessageCircle className="w-4 h-4" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            {metric.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metric.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
