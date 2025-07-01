
import React from 'react';
import { ScheduleCalendar } from './scheduler/ScheduleCalendar';
import { PostComposer } from './scheduler/PostComposer';

export const ContentScheduler = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Content Scheduler</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PostComposer />
        <ScheduleCalendar />
      </div>
    </div>
  );
};
