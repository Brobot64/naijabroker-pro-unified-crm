
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuoteService } from "@/services/database/quoteService";
import { PolicyService } from "@/services/database/policyService";
import { ClaimService } from "@/services/database/claimService";


interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: string;
  amount: string;
  created_at: Date;
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentActivities = async () => {
    setLoading(true);
    try {
      const [quotes, policies, claims] = await Promise.all([
        QuoteService.getAll(),
        PolicyService.getAll(),
        ClaimService.getAll()
      ]);

      const recentActivities: Activity[] = [];

      // Add recent quotes
      quotes
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .forEach(quote => {
          recentActivities.push({
            id: `quote-${quote.id}`,
            type: "Quote Generated",
            description: `${quote.policy_type} quote #${quote.quote_number} for ${quote.client_name}`,
            timestamp: formatTimestamp(quote.created_at),
            status: quote.status === 'draft' ? 'draft' : 
                   quote.workflow_stage === 'converted' ? 'converted' : 
                   quote.status === 'accepted' ? 'accepted' : 'pending',
            amount: `₦${Number(quote.premium || 0).toLocaleString()}`,
            created_at: new Date(quote.created_at)
          });
        });

      // Add recent policies
      policies
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 2)
        .forEach(policy => {
          recentActivities.push({
            id: `policy-${policy.id}`,
            type: "Policy Issued",
            description: `${policy.policy_type} Policy #${policy.policy_number} issued for ${policy.client_name}`,
            timestamp: formatTimestamp(policy.created_at),
            status: policy.status === 'active' ? 'completed' : policy.status,
            amount: `₦${Number(policy.premium || 0).toLocaleString()}`,
            created_at: new Date(policy.created_at)
          });
        });

      // Add recent claims
      claims
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 2)
        .forEach(claim => {
          recentActivities.push({
            id: `claim-${claim.id}`,
            type: "Claim Filed",
            description: `${claim.claim_type} claim #${claim.claim_number} filed by ${claim.client_name}`,
            timestamp: formatTimestamp(claim.created_at),
            status: claim.status === 'registered' ? 'under-review' : 
                   claim.status === 'settled' ? 'completed' : claim.status,
            amount: `₦${Number(claim.estimated_loss || 0).toLocaleString()}`,
            created_at: new Date(claim.created_at)
          });
        });

      // Sort all activities by timestamp and take the most recent 5
      const sortedActivities = recentActivities
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
        .slice(0, 5);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error loading recent activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  useEffect(() => {
    loadRecentActivities();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "under-review":
        return "bg-blue-100 text-blue-800";
      case "converted":
      case "accepted":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent activities found
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-foreground">{activity.type}</h4>
                    <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{activity.timestamp}</span>
                    <span className="font-semibold">{activity.amount}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
