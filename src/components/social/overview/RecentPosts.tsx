
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share } from "lucide-react";

interface Post {
  id: string;
  platform: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  status: 'published' | 'scheduled' | 'draft';
}

export const RecentPosts = () => {
  const posts: Post[] = [
    {
      id: '1',
      platform: 'LinkedIn',
      content: 'Insurance protection is more important than ever in Nigeria...',
      timestamp: '2 hours ago',
      likes: 45,
      comments: 12,
      shares: 8,
      status: 'published'
    },
    {
      id: '2',
      platform: 'Twitter',
      content: 'Quick tip: Always read your policy terms carefully...',
      timestamp: '4 hours ago',
      likes: 23,
      comments: 6,
      shares: 15,
      status: 'published'
    },
    {
      id: '3',
      platform: 'Instagram',
      content: 'Behind the scenes: Our team at work securing your future',
      timestamp: '1 day ago',
      likes: 78,
      comments: 24,
      shares: 12,
      status: 'published'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Posts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="border-b border-gray-100 pb-4 last:border-b-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{post.platform}</Badge>
                <Badge className={getStatusColor(post.status)}>
                  {post.status}
                </Badge>
              </div>
              <span className="text-xs text-gray-500">{post.timestamp}</span>
            </div>
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {post.content}
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{post.comments}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share className="w-3 h-3" />
                <span>{post.shares}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
