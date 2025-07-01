
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScheduledPost {
  id: string;
  title: string;
  platform: string;
  time: string;
  status: 'scheduled' | 'published' | 'failed';
}

export const ScheduleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const scheduledPosts: ScheduledPost[] = [
    {
      id: '1',
      title: 'Insurance Tips for Young Professionals',
      platform: 'LinkedIn',
      time: '10:00 AM',
      status: 'scheduled'
    },
    {
      id: '2',
      title: 'Motor Insurance Benefits',
      platform: 'Twitter',
      time: '2:00 PM',
      status: 'scheduled'
    },
    {
      id: '3',
      title: 'Client Success Story',
      platform: 'Instagram',
      time: '5:00 PM',
      status: 'published'
    }
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Content Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-600 mb-3">
            Today's Schedule
          </div>
          {scheduledPosts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{post.title}</div>
                <div className="text-xs text-gray-500">{post.platform} • {post.time}</div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                post.status === 'published' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {post.status}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
