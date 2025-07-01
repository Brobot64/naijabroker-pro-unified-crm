
import React from 'react';
import { SocialMetrics } from './overview/SocialMetrics';
import { PlatformBreakdown } from './overview/PlatformBreakdown';
import { RecentPosts } from './overview/RecentPosts';

export const SocialOverview = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Social Media Overview</h2>
      </div>
      
      <SocialMetrics />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlatformBreakdown />
        <RecentPosts />
      </div>
    </div>
  );
};
