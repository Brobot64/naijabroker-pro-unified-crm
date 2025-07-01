
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Copy,
  Send,
  Eye
} from "lucide-react";

export const ContentScheduler = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock scheduled posts
  const scheduledPosts = [
    {
      id: 1,
      platform: "Facebook",
      content: "Protect your business with comprehensive commercial insurance...",
      scheduledTime: "2024-07-01T15:00:00",
      status: "scheduled",
      mediaCount: 2
    },
    {
      id: 2,
      platform: "Instagram",
      content: "Home insurance tips for the rainy season ☔",
      scheduledTime: "2024-07-01T18:00:00",
      status: "scheduled",
      mediaCount: 1
    },
    {
      id: 3,
      platform: "LinkedIn",
      content: "Insurance industry insights: Digital transformation trends...",
      scheduledTime: "2024-07-02T09:00:00",
      status: "draft",
      mediaCount: 0
    }
  ];

  const timeSlots = [
    { time: "09:00", label: "Morning Peak", recommended: true },
    { time: "12:00", label: "Lunch Break", recommended: false },
    { time: "15:00", label: "Afternoon", recommended: true },
    { time: "18:00", label: "Evening Peak", recommended: true },
    { time: "21:00", label: "Night", recommended: false }
  ];

  const platforms = [
    { name: "Facebook", color: "bg-blue-600", connected: true },
    { name: "Instagram", color: "bg-pink-600", connected: true },
    { name: "Twitter", color: "bg-sky-500", connected: true },
    { name: "LinkedIn", color: "bg-blue-700", connected: true },
    { name: "TikTok", color: "bg-black", connected: false },
    { name: "YouTube", color: "bg-red-600", connected: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Scheduler</h2>
          <p className="text-gray-600">Plan and schedule your social media content</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Bulk Schedule
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Content Calendar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simple calendar representation */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center font-medium text-sm text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => (
                  <div key={i} className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer">
                    <div className="text-sm text-gray-600">{(i % 31) + 1}</div>
                    {i % 7 === 0 && (
                      <div className="mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mb-1"></div>
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Posts List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Scheduled Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledPosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{post.platform}</Badge>
                        <Badge className={
                          post.status === 'scheduled' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {post.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(post.scheduledTime).toLocaleString()}</span>
                      </div>
                      {post.mediaCount > 0 && (
                        <span>{post.mediaCount} media file{post.mediaCount > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Optimal Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Optimal Times</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="font-medium text-sm">{slot.time}</div>
                      <div className="text-xs text-gray-500">{slot.label}</div>
                    </div>
                    {slot.recommended && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Status */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {platforms.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                    <Badge className={
                      platform.connected 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {platform.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Post Now
              </Button>
              <Button className="w-full" variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate Last Post
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule for Later
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
