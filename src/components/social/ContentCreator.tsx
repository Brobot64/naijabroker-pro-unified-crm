
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Image, 
  Video, 
  Hash,
  Lightbulb,
  Palette,
  Scissors,
  Sparkles,
  Send,
  Save,
  Calendar,
  Eye
} from "lucide-react";

export const ContentCreator = () => {
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const platforms = [
    { name: "Facebook", limit: 63206, features: ["text", "image", "video", "link"] },
    { name: "Instagram", limit: 2200, features: ["text", "image", "video", "story"] },
    { name: "Twitter", limit: 280, features: ["text", "image", "video", "thread"] },
    { name: "LinkedIn", limit: 3000, features: ["text", "image", "video", "article"] },
    { name: "TikTok", limit: 150, features: ["video", "text"] },
    { name: "YouTube", limit: 5000, features: ["video", "text", "thumbnail"] }
  ];

  const hashtagSuggestions = [
    { tag: "#InsuranceTips", popularity: "High", posts: "45K" },
    { tag: "#AutoInsurance", popularity: "Medium", posts: "23K" },
    { tag: "#BusinessInsurance", popularity: "Medium", posts: "18K" },
    { tag: "#LifeInsurance", popularity: "High", posts: "67K" },
    { tag: "#HomeInsurance", popularity: "Medium", posts: "34K" },
    { tag: "#InsuranceAdvice", popularity: "Low", posts: "12K" }
  ];

  const contentIdeas = [
    {
      category: "Educational",
      ideas: [
        "5 Common Insurance Myths Debunked",
        "How to File an Insurance Claim Correctly",
        "Understanding Your Policy Coverage"
      ]
    },
    {
      category: "Promotional",
      ideas: [
        "New Client Welcome Package",
        "Seasonal Insurance Discounts",
        "Referral Program Benefits"
      ]
    },
    {
      category: "Engagement",
      ideas: [
        "Insurance Quiz: Test Your Knowledge",
        "Share Your Insurance Success Story",
        "Ask the Expert: Q&A Session"
      ]
    }
  ];

  const brandTemplates = [
    { name: "Professional Blue", colors: ["#2563eb", "#64748b", "#ffffff"] },
    { name: "Insurance Green", colors: ["#16a34a", "#374151", "#ffffff"] },
    { name: "Trust Orange", colors: ["#ea580c", "#1f2937", "#ffffff"] },
    { name: "Corporate Gray", colors: ["#6b7280", "#111827", "#ffffff"] }
  ];

  const togglePlatform = (platformName: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformName) 
        ? prev.filter(p => p !== platformName)
        : [...prev, platformName]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Creator</h2>
          <p className="text-gray-600">Create engaging content for your social media platforms</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button>
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Creation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Select Platforms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <div
                    key={platform.name}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedPlatforms.includes(platform.name)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => togglePlatform(platform.name)}
                  >
                    <div className="font-medium text-sm">{platform.name}</div>
                    <div className="text-xs text-gray-500">
                      {platform.limit.toLocaleString()} chars
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Input */}
          <Card>
            <CardHeader>
              <CardTitle>Create Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="content">Post Content</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind? Share valuable insurance insights with your audience..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={6}
                  className="mt-1"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{postContent.length} characters</span>
                  <span>Optimal length: 100-280 characters</span>
                </div>
              </div>

              <Tabs defaultValue="text" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Sparkles className="w-6 h-6 mb-2" />
                      <span>AI Enhance</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <FileText className="w-6 h-6 mb-2" />
                      <span>Grammar Check</span>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Image className="w-6 h-6 mb-2" />
                      <span>Add Image</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Video className="w-6 h-6 mb-2" />
                      <span>Add Video</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Palette className="w-6 h-6 mb-2" />
                      <span>Create Graphic</span>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="design" className="space-y-4">
                  <div>
                    <Label>Brand Templates</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {brandTemplates.map((template, index) => (
                        <div key={index} className="border rounded-lg p-3 cursor-pointer hover:border-gray-300">
                          <div className="font-medium text-sm mb-2">{template.name}</div>
                          <div className="flex space-x-1">
                            {template.colors.map((color, colorIndex) => (
                              <div
                                key={colorIndex}
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="hashtags" className="space-y-4">
                  <div>
                    <Label>Suggested Hashtags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {hashtagSuggestions.map((hashtag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => setPostContent(prev => prev + " " + hashtag.tag)}
                        >
                          {hashtag.tag}
                          <span className="ml-1 text-xs text-gray-500">
                            ({hashtag.posts})
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Content Ideas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Content Ideas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentIdeas.map((category, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">
                      {category.category}
                    </h4>
                    <div className="space-y-2">
                      {category.ideas.map((idea, ideaIndex) => (
                        <div
                          key={ideaIndex}
                          className="text-xs text-gray-600 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() => setPostContent(idea)}
                        >
                          {idea}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Posting Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Schedule Post</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Post Date & Time</Label>
                <Input type="datetime-local" className="mt-1" />
              </div>
              <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                💡 Best time to post: 3:00 PM on weekdays for maximum engagement
              </div>
              <Button className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Post
              </Button>
            </CardContent>
          </Card>

          {/* Performance Prediction */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expected Reach</span>
                  <span className="font-medium">2.5K - 3.2K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Est. Engagement</span>
                  <span className="font-medium">4.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Optimal Platform</span>
                  <Badge>Instagram</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
