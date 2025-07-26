import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuoteService } from "@/services/database/quoteService";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  Target,
  Share2,
  MessageSquare,
  Heart
} from "lucide-react";

interface KPIMetrics {
  quotes: {
    totalQuotes: number;
    activeQuotes: number;
    conversionRate: number;
    averageValue: number;
    weeklyGrowth: number;
  };
  financial: {
    totalRevenue: number;
    monthlyRevenue: number;
    projectedRevenue: number;
    outstandingPayments: number;
  };
  social: {
    engagement: number;
    reach: number;
    leads: number;
    conversions: number;
  };
}

export const QuoteFinancialSocialKPIs = () => {
  const [metrics, setMetrics] = useState<KPIMetrics>({
    quotes: {
      totalQuotes: 0,
      activeQuotes: 0,
      conversionRate: 0,
      averageValue: 0,
      weeklyGrowth: 0
    },
    financial: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      projectedRevenue: 0,
      outstandingPayments: 0
    },
    social: {
      engagement: 0,
      reach: 0,
      leads: 0,
      conversions: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIMetrics();
  }, []);

  const loadKPIMetrics = async () => {
    try {
      const quotes = await QuoteService.getAll();
      
      const currentDate = new Date();
      const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Quote metrics
      const totalQuotes = quotes.length;
      const activeQuotes = quotes.filter(q => 
        ['quote-evaluation', 'client-selection', 'client_approved'].includes(q.workflow_stage || '')
      ).length;
      
      const completedQuotes = quotes.filter(q => q.workflow_stage === 'completed').length;
      const conversionRate = totalQuotes > 0 ? (completedQuotes / totalQuotes) * 100 : 0;
      
      const totalQuoteValue = quotes.reduce((sum, q) => sum + Number(q.premium || 0), 0);
      const averageValue = totalQuotes > 0 ? totalQuoteValue / totalQuotes : 0;
      
      const weeklyQuotes = quotes.filter(q => new Date(q.created_at) >= lastWeek).length;
      const previousWeekQuotes = quotes.filter(q => {
        const date = new Date(q.created_at);
        return date >= new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000) && date < lastWeek;
      }).length;
      const weeklyGrowth = previousWeekQuotes > 0 ? 
        ((weeklyQuotes - previousWeekQuotes) / previousWeekQuotes) * 100 : 0;

      // Financial metrics (simulated based on quotes)
      const monthlyQuotes = quotes.filter(q => {
        const date = new Date(q.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      
      const monthlyRevenue = monthlyQuotes.reduce((sum, q) => 
        sum + (Number(q.premium || 0) * 0.15), 0); // Assuming 15% commission
      
      const totalRevenue = quotes.reduce((sum, q) => 
        sum + (Number(q.premium || 0) * 0.15), 0);
      
      const projectedRevenue = monthlyRevenue * 12;
      const outstandingPayments = quotes.filter(q => 
        q.workflow_stage === 'client_approved' && q.payment_status === 'pending'
      ).reduce((sum, q) => sum + Number(q.premium || 0), 0);

      // Social metrics (simulated)
      const engagement = Math.floor(Math.random() * 1000) + 500;
      const reach = Math.floor(Math.random() * 5000) + 2000;
      const leads = Math.floor(Math.random() * 50) + 20;
      const conversions = Math.floor(leads * 0.3);

      setMetrics({
        quotes: {
          totalQuotes,
          activeQuotes,
          conversionRate,
          averageValue,
          weeklyGrowth
        },
        financial: {
          totalRevenue,
          monthlyRevenue,
          projectedRevenue,
          outstandingPayments
        },
        social: {
          engagement,
          reach,
          leads,
          conversions
        }
      });
    } catch (error) {
      console.error('Error loading KPI metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quote KPIs */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Quote Management KPIs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{metrics.quotes.totalQuotes}</div>
                  <p className="text-xs text-muted-foreground">Total Quotes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{metrics.quotes.activeQuotes}</div>
                  <p className="text-xs text-muted-foreground">Active Quotes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{metrics.quotes.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.quotes.averageValue)}</div>
                  <p className="text-xs text-muted-foreground">Avg Quote Value</p>
                  <div className="flex items-center mt-1">
                    <Badge variant={metrics.quotes.weeklyGrowth >= 0 ? "default" : "destructive"} className="text-xs">
                      {metrics.quotes.weeklyGrowth >= 0 ? '+' : ''}{metrics.quotes.weeklyGrowth.toFixed(1)}% weekly
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial KPIs */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Financial KPIs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.financial.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.financial.monthlyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.financial.projectedRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Projected Annual</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.financial.outstandingPayments)}</div>
                  <p className="text-xs text-muted-foreground">Outstanding Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Social Media KPIs */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Social Media KPIs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{formatNumber(metrics.social.engagement)}</div>
                  <p className="text-xs text-muted-foreground">Monthly Engagement</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{formatNumber(metrics.social.reach)}</div>
                  <p className="text-xs text-muted-foreground">Monthly Reach</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{metrics.social.leads}</div>
                  <p className="text-xs text-muted-foreground">Social Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{metrics.social.conversions}</div>
                  <p className="text-xs text-muted-foreground">Social Conversions</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {((metrics.social.conversions / metrics.social.leads) * 100).toFixed(1)}% rate
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};