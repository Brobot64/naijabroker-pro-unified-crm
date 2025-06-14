
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsOverviewProps {
  userRole: string;
}

export const StatsOverview = ({ userRole }: StatsOverviewProps) => {
  const stats = [
    {
      title: "Active Policies",
      value: "2,345",
      change: "+12.5%",
      changeType: "positive" as const,
    },
    {
      title: "Monthly Premium",
      value: "₦45.2M",
      change: "+8.2%",
      changeType: "positive" as const,
    },
    {
      title: "Pending Claims",
      value: "23",
      change: "-15.3%",
      changeType: "positive" as const,
    },
    {
      title: "Conversion Rate",
      value: "68.5%",
      change: "+5.1%",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className={`text-xs flex items-center mt-1 ${
              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{stat.change} from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
