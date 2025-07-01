
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Heart,
  Share2,
  Eye,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export const SocialOverview = () => {
  const overviewStats = [
    {
      title: "Total Followers",
      value: "12.4K",
      change: "+8.2%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Engagement Rate",
      value: "4.7%",
      change: "+12%",
      icon: Heart,
      color: "text-pink-600",
    },
    {
      title: "Monthly Reach",
      value: "89.2K",
      change: "+15%",
      icon: Eye,
      color: "text-green-600",
    },
    {
      title: "Pending Responses",
      value: "23",
      change: "-5",
      icon: MessageSquare,
      color: "text-orange-600",
    },
  ];

  const recentPosts = [
    {
      id: 1,
      platform: "Facebook",
      content: "New insurance packages available for small businesses...",
      time: "2 hours ago",
      engagement: { likes: 45, comments: 12, shares: 8 },
      status: "published"
    },
    {
      id: 2,
      platform: "Instagram",
      content: "Tips for choosing the right auto insurance coverage...",
      time: "4 hours ago",
      engagement: { likes: 89, comments: 23, shares: 15 },
      status: "published"
    },
    {
      id: 3,
      platform: "LinkedIn",
      content: "Industry insights: Insurance market trends 2024...",
      time: "6 hours ago",
      engagement: { likes: 67, comments: 34, shares: 22 },
      status: "published"
    }
  ];

  const upcomingPosts = [
    {
      id: 1,
      platform: "Twitter",
      content: "Don't let unexpected events catch you off guard...",
      scheduledFor: "Today, 3:00 PM",
      status: "scheduled"
    },
    {
      id: 2,
      platform: "Instagram",
      content: "Weekend insurance tips for homeowners...",
      scheduledFor: "Tomorrow, 10:00 AM",
      status: "scheduled"
    }
  ];

  const alerts = [
    {
      type: "mention",
      platform: "Twitter",
      message: "You were mentioned in a tweet about insurance claims",
      time: "30 minutes ago",
      priority: "high"
    },
    {
      type: "comment",
      platform: "Facebook",
      message: "New comment on your post about life insurance",
      time: "1 hour ago",
      priority: "medium"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recent Posts Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{post.platform}</Badge>
                    <span className="text-xs text-gray-500">{post.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{post.engagement.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{post.engagement.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-3 h-3" />
                      <span>{post.engagement.shares}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Upcoming */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Recent Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className="border-l-4 border-orange-400 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline">{alert.platform}</Badge>
                      <Badge className={
                        alert.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Upcoming Posts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{post.platform}</Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{post.content}</p>
                    <p className="text-xs text-gray-500">{post.scheduledFor}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Scheduled Posts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
