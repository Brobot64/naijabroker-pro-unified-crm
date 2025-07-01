
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Image, Send } from "lucide-react";

export const PostComposer = () => {
  const [postContent, setPostContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const platforms = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' }
  ];

  const handleSchedulePost = () => {
    // Handle post scheduling logic
    console.log('Scheduling post:', {
      content: postContent,
      platform: selectedPlatform,
      date: scheduleDate,
      time: scheduleTime
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((platform) => (
                <SelectItem key={platform.value} value={platform.value}>
                  {platform.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="content">Post Content</Label>
          <Textarea
            id="content"
            placeholder="What would you like to share?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={4}
          />
          <div className="text-xs text-gray-500 mt-1">
            {postContent.length}/280 characters
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Schedule Date</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>
          <div>
            <Label htmlFor="time">Schedule Time</Label>
            <div className="relative">
              <Input
                id="time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" className="flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span>Add Media</span>
          </Button>
          <div className="space-x-2">
            <Button variant="outline">Save Draft</Button>
            <Button onClick={handleSchedulePost} className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Schedule Post</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
