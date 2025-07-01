
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageSquare, 
  Share2,
  Eye,
  Target,
  BarChart3,
  Download,
  Calendar
} from "lucide-react";

export const SocialAnalytics = () => {
  const engagementData = [
    { platform: "Facebook", engagement: 4.2, reach: "12.5K", clicks: 342 },
    { platform: "Instagram", engagement: 6.8, reach: "18.3K", clicks: 567 },
    { platform: "Twitter", engagement: 3.1, reach: "8.9K", clicks: 234 },
    { platform: "LinkedIn", engagement: 5.4, reach: "15.2K", clicks: 445 }
  ];

  const topPosts = [
    {
      platform: "Instagram",
      content: "5 Essential Insurance Tips for New Homeowners",
      engagement: 1245,
      reach: 8900,
      date: "2024-06-25"
    },
    {
      platform: "Facebook",
      content: "How to Choose the Right Life Insurance Policy",
      engagement: 892,
      reach: 6700,
      date: "2024-06-22"
    },
    {
      platform: "LinkedIn",
      content: "Insurance Market Trends: What to Expect in 2024",
      engagement: 756,
      reach: 5400,
      date: "2024-06-20"
    }
  ];

  const audienceData = [
    { demographic: "Age 25-34", percentage: 35, growth: "+12%" },
    { demographic: "Age 35-44", percentage: 28, growth: "+8%" },
    { demographic: "Age 45-54", percentage: 22, growth: "+15%" },
    { demographic: "Age 55+", percentage: 15, growth: "+5%" }
  ];

  const competitorData = [
    { name: "Insurance Co A", followers: "45K", engagement: "3.2%" },
    { name: "Insurance Co B", followers: "32K", engagement: "4.1%" },
    { name: "Insurance Co C", followers: "28K", engagement: "2.8%" },
    { name: "Industry Average", followers: "35K", engagement: "3.5%" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Media Analytics</h2>
          <p className="text-gray-600">Track performance across all platforms</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Platform Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {engagementData.map((platform, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {platform.platform}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Engagement</span>
                      <span className="text-sm font-bold">{platform.engagement}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Reach</span>
                      <span className="text-sm font-bold">{platform.reach}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Clicks</span>
                      <span className="text-sm font-bold">{platform.clicks}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top Performing Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Top Performing Posts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{post.platform}</Badge>
                      <span className="text-xs text-gray-500">{post.date}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-3">
                      {post.content}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{post.engagement} engagements</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{post.reach} reach</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Engagement chart would be rendered here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Audience Demographics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audienceData.map((demo, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">{demo.demographic}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{demo.percentage}%</div>
                        <div className="text-xs text-green-600">{demo.growth}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Follower Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Growth chart would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">68%</div>
                  <div className="text-sm text-gray-600">Posts with Images</div>
                  <div className="text-xs text-green-600">+15% engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">4.2%</div>
                  <div className="text-sm text-gray-600">Avg. Engagement Rate</div>
                  <div className="text-xs text-green-600">Above industry avg.</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">3:00 PM</div>
                  <div className="text-sm text-gray-600">Best Posting Time</div>
                  <div className="text-xs text-gray-500">Weekdays</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Competitor Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitorData.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="font-medium">{competitor.name}</div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{competitor.followers}</span>
                        <span className="ml-1">followers</span>
                      </div>
                      <div>
                        <span className="font-medium">{competitor.engagement}</span>
                        <span className="ml-1">engagement</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
