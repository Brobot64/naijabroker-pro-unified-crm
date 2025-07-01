
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const ChartsSection = () => {
  const premiumClaimsData = [
    { month: 'Jan', premium: 200, claims: 60 },
    { month: 'Feb', premium: 210, claims: 65 },
    { month: 'Mar', premium: 215, claims: 70 },
    { month: 'Apr', premium: 220, claims: 75 },
    { month: 'May', premium: 225, claims: 75 },
    { month: 'Jun', premium: 230, claims: 80 },
    { month: 'Jul', premium: 235, claims: 80 },
    { month: 'Aug', premium: 240, claims: 85 },
    { month: 'Sep', premium: 245, claims: 85 },
    { month: 'Oct', premium: 250, claims: 90 },
    { month: 'Nov', premium: 240, claims: 85 },
    { month: 'Dec', premium: 210, claims: 80 },
  ];

  const productMixData = [
    { name: 'Motor', value: 35, color: '#1e40af' },
    { name: 'Property', value: 25, color: '#059669' },
    { name: 'Health', value: 15, color: '#d97706' },
    { name: 'Life', value: 10, color: '#7c3aed' },
    { name: 'Marine', value: 8, color: '#0891b2' },
    { name: 'Aviation', value: 4, color: '#dc2626' },
    { name: 'Oil & Gas', value: 2, color: '#9333ea' },
    { name: 'Liability', value: 1, color: '#65a30d' },
  ];

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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={premiumClaimsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [
                      `₦${value}M`, 
                      name === 'premium' ? 'Premium (₦M)' : 'Claims (₦M)'
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productMixData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    fontSize={10}
                  >
                    {productMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              {productMixData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
