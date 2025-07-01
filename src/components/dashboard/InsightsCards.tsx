
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const InsightsCards = () => {
  const insights = [
    {
      title: "Total Premium",
      value: "₦2,437,650,000",
      subtitle: "YTD",
      color: "border-l-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Claims Ratio",
      value: "37.0%",
      subtitle: "Target: <40%",
      color: "border-l-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Pending Renewals",
      value: "126",
      subtitle: "Next 60 days",
      color: "border-l-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      title: "Cross-Sell Rate",
      value: "34.5%",
      subtitle: "Target: >70%",
      color: "border-l-purple-500",
      bgColor: "bg-purple-50"
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Insurance Insights Dashboard</h2>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className={`${insight.bgColor} border-l-4 ${insight.color}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{insight.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">{insight.value}</div>
              <p className="text-xs text-gray-500">{insight.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
