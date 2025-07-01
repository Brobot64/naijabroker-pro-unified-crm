
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Heart, 
  AtSign, 
  Send,
  Search,
  Filter,
  Archive,
  Star,
  Clock,
  CheckCircle
} from "lucide-react";

export const UnifiedInbox = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");

  const messages = [
    {
      id: 1,
      type: "comment",
      platform: "Facebook",
      user: "John Smith",
      avatar: "JS",
      content: "I'm interested in your business insurance packages. Can you provide more details?",
      timestamp: "2 hours ago",
      postRef: "Business Insurance Post",
      priority: "high",
      status: "unread"
    },
    {
      id: 2,
      type: "mention",
      platform: "Twitter",
      user: "Sarah Johnson",
      avatar: "SJ",
      content: "@NaijaBrokerPro Thanks for the helpful insurance tips! Very informative thread.",
      timestamp: "4 hours ago",
      postRef: "Insurance Tips Thread",
      priority: "medium",
      status: "read"
    },
    {
      id: 3,
      type: "message",
      platform: "Instagram",
      user: "Mike Chen",
      avatar: "MC",
      content: "Hi, I saw your post about auto insurance. I need coverage for my new car. What are your rates?",
      timestamp: "6 hours ago",
      postRef: "Direct Message",
      priority: "high",
      status: "unread"
    },
    {
      id: 4,
      type: "comment",
      platform: "LinkedIn",
      user: "Professional Corp",
      avatar: "PC",
      content: "Great insights on commercial insurance trends. We'd like to discuss partnership opportunities.",
      timestamp: "1 day ago",
      postRef: "Industry Insights Post",
      priority: "medium",
      status: "replied"
    }
  ];

  const responseTemplates = [
    {
      name: "Auto Insurance Inquiry",
      content: "Thank you for your interest in our auto insurance services. We'd be happy to provide you with a personalized quote. Please provide us with your vehicle details and we'll get back to you within 24 hours."
    },
    {
      name: "Business Insurance Info",
      content: "We offer comprehensive business insurance packages tailored to your industry needs. Let's schedule a consultation to discuss your specific requirements. You can reach us at [phone] or book online."
    },
    {
      name: "General Thank You",
      content: "Thank you for your interest in our services! We appreciate your engagement. Feel free to reach out if you have any questions about our insurance solutions."
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "comment": return <MessageSquare className="w-4 h-4" />;
      case "mention": return <AtSign className="w-4 h-4" />;
      case "message": return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread": return "bg-blue-100 text-blue-800";
      case "read": return "bg-gray-100 text-gray-800";
      case "replied": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Unified Inbox</h2>
          <p className="text-gray-600">Manage all social media interactions in one place</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Archive className="w-4 h-4 mr-2" />
            Archive All Read
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Messages & Interactions</span>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">All (12)</TabsTrigger>
                  <TabsTrigger value="unread">Unread (5)</TabsTrigger>
                  <TabsTrigger value="mentions">Mentions (3)</TabsTrigger>
                  <TabsTrigger value="messages">DMs (4)</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {message.avatar}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{message.user}</span>
                              <Badge variant="outline">{message.platform}</Badge>
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              {getTypeIcon(message.type)}
                              <span className="text-xs text-gray-500">{message.postRef}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                          <div className="flex space-x-1">
                            <Badge className={getPriorityColor(message.priority)}>
                              {message.priority}
                            </Badge>
                            <Badge className={getStatusColor(message.status)}>
                              {message.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Reply
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Star className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Archive className="w-3 h-3" />
                          </Button>
                        </div>
                        {message.status === 'unread' && (
                          <Button size="sm" variant="ghost">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Reply Panel & Templates */}
        <div className="space-y-6">
          {/* Quick Reply */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Quick Reply</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your response..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Reply
                </Button>
                <Button variant="outline">
                  <Clock className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Response Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Response Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {responseTemplates.map((template, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium text-sm mb-1">{template.name}</div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {template.content}
                    </p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="mt-2"
                      onClick={() => setReplyText(template.content)}
                    >
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Response Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Response Time</span>
                  <span className="font-medium">2.5 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Messages Today</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Responses</span>
                  <span className="font-medium text-red-600">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Satisfaction Rate</span>
                  <span className="font-medium text-green-600">94%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
