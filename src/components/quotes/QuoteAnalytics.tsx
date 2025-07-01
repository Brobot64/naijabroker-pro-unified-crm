
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export const QuoteAnalytics = () => {
  // Mock data for analytics
  const monthlyQuotes = [
    { month: 'Jan', quotes: 45, converted: 12, value: 125000000 },
    { month: 'Feb', quotes: 52, converted: 15, value: 145000000 },
    { month: 'Mar', quotes: 48, converted: 18, value: 165000000 },
    { month: 'Apr', quotes: 61, converted: 22, value: 185000000 },
    { month: 'May', quotes: 55, converted: 19, value: 175000000 },
    { month: 'Jun', quotes: 67, converted: 25, value: 205000000 },
  ];

  const quotesByStatus = [
    { name: 'Draft', value: 25, color: '#fbbf24' },
    { name: 'Sent', value: 35, color: '#3b82f6' },
    { name: 'Accepted', value: 20, color: '#10b981' },
    { name: 'Rejected', value: 12, color: '#ef4444' },
    { name: 'Expired', value: 8, color: '#6b7280' },
  ];

  const conversionRate = [
    { month: 'Jan', rate: 26.7 },
    { month: 'Feb', rate: 28.8 },
    { month: 'Mar', rate: 37.5 },
    { month: 'Apr', rate: 36.1 },
    { month: 'May', rate: 34.5 },
    { month: 'Jun', rate: 37.3 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">34.2%</div>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
            <p className="text-xs text-green-600">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦1.2B</div>
            <p className="text-xs text-muted-foreground">Total Quote Value</p>
            <p className="text-xs text-green-600">+15.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">14 days</div>
            <p className="text-xs text-muted-foreground">Avg. Processing Time</p>
            <p className="text-xs text-red-600">+1.2 days from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">Client Satisfaction</p>
            <p className="text-xs text-green-600">+3.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Quote Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyQuotes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quotes" fill="#3b82f6" name="Total Quotes" />
                <Bar dataKey="converted" fill="#10b981" name="Converted" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={quotesByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {quotesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Conversion Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote Value Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyQuotes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`₦${(value / 1000000).toFixed(1)}M`, 'Quote Value']} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Total Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
