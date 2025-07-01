
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PlatformData {
  name: string;
  followers: number;
  engagement: number;
  color: string;
}

export const PlatformBreakdown = () => {
  const platforms: PlatformData[] = [
    { name: "LinkedIn", followers: 12500, engagement: 5.2, color: "#0077B5" },
    { name: "Twitter", followers: 8200, engagement: 3.8, color: "#1DA1F2" },
    { name: "Instagram", followers: 3800, engagement: 6.1, color: "#E4405F" },
    { name: "Facebook", followers: 2100, engagement: 2.4, color: "#1877F2" }
  ];

  const totalFollowers = platforms.reduce((sum, platform) => sum + platform.followers, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {platforms.map((platform, index) => {
          const percentage = (platform.followers / totalFollowers) * 100;
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: platform.color }}
                  />
                  <span className="font-medium">{platform.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {platform.followers.toLocaleString()} followers
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="text-xs text-gray-500">
                {platform.engagement}% engagement rate
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
