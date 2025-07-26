
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDashboardData } from "@/hooks/useDashboardData";

export const ChartsSection = () => {
  const { monthlyTrends, productMix, loading } = useDashboardData();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-blue-500 pl-3">
        Charts & Visualizations
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium vs Claims Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Premium vs Claims Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `₦${Number(value).toLocaleString()}`, 
                        name === 'premium' ? 'Premium' : 'Claims'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="premium" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="claims" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Premium (₦M)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Claims (₦M)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Mix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Mix</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : productMix.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">No policy data available</p>
              </div>
            ) : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productMix}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="percentage"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        fontSize={10}
                      >
                        {productMix.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  {productMix.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span>{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
