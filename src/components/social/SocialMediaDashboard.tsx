
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Settings,
  Users,
  TrendingUp,
  FileText,
  Zap
} from "lucide-react";
import { SocialOverview } from "./SocialOverview";
import { ContentScheduler } from "./ContentScheduler";
import { SocialAnalytics } from "./SocialAnalytics";
import { UnifiedInbox } from "./UnifiedInbox";
import { ContentCreator } from "./ContentCreator";
import { TeamManagement } from "./TeamManagement";
import { SocialSettings } from "./SocialSettings";

export const SocialMediaDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock connected platforms
  const connectedPlatforms = [
    { name: "Facebook", status: "connected", followers: "2.3K", posts: 45 },
    { name: "Instagram", status: "connected", followers: "5.1K", posts: 78 },
    { name: "Twitter", status: "connected", followers: "1.8K", posts: 123 },
    { name: "LinkedIn", status: "connected", followers: "3.2K", posts: 34 },
    { name: "TikTok", status: "pending", followers: "0", posts: 0 },
    { name: "YouTube", status: "disconnected", followers: "0", posts: 0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "disconnected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Social Media Management
          </h1>
          <p className="text-gray-600">
            Manage your insurance brokerage's social media presence across all platforms
          </p>
        </div>

        {/* Platform Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {connectedPlatforms.map((platform, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{platform.name}</h3>
                  <Badge className={getStatusColor(platform.status)}>
                    {platform.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">
                    Followers: {platform.followers}
                  </p>
                  <p className="text-xs text-gray-600">
                    Posts: {platform.posts}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="inbox" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Inbox</span>
            </TabsTrigger>
            <TabsTrigger value="creator" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Create</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Team</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SocialOverview />
          </TabsContent>

          <TabsContent value="scheduler">
            <ContentScheduler />
          </TabsContent>

          <TabsContent value="analytics">
            <SocialAnalytics />
          </TabsContent>

          <TabsContent value="inbox">
            <UnifiedInbox />
          </TabsContent>

          <TabsContent value="creator">
            <ContentCreator />
          </TabsContent>

          <TabsContent value="team">
            <TeamManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SocialSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
