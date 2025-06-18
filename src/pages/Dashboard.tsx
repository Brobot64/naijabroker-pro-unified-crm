
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Settings,
  BarChart3
} from "lucide-react";
import { PolicyManagement } from "@/components/policies/PolicyManagement";
import { QuoteManagement } from "@/components/quotes/QuoteManagement";
import { ClaimsManagement } from "@/components/claims/ClaimsManagement";
import { FinancialManagement } from "@/components/financial/FinancialManagement";
import { WorkflowManager } from "@/components/workflow/WorkflowManager";
import { RenewalReminders } from "@/components/policies/RenewalReminders";
import { UserManagement } from "@/components/admin/UserManagement";
import { ComplianceReports } from "@/components/compliance/ComplianceReports";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock dashboard stats
  const stats = [
    {
      title: "Active Policies",
      value: "1,234",
      change: "+12%",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Monthly Premium",
      value: "₦45.2M",
      change: "+8%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Pending Claims",
      value: "23",
      change: "-5%",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: "Team Members",
      value: "15",
      change: "+2",
      icon: Users,
      color: "text-purple-600",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "policy",
      message: "New Motor Insurance policy created for Dangote Industries",
      time: "2 hours ago",
      status: "completed"
    },
    {
      id: 2,
      type: "claim",
      message: "Fire Insurance claim approved for GTBank Plc",
      time: "4 hours ago",
      status: "approved"
    },
    {
      id: 3,
      type: "workflow",
      message: "Quote approval pending for First Bank Premium",
      time: "6 hours ago",
      status: "pending"
    },
    {
      id: 4,
      type: "renewal",
      message: "Policy renewal reminder sent to Access Bank",
      time: "1 day ago",
      status: "completed"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "policy": return <FileText className="w-4 h-4" />;
      case "claim": return <CheckCircle className="w-4 h-4" />;
      case "workflow": return <Clock className="w-4 h-4" />;
      case "renewal": return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Insurance Broker Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome to NaijaBroker Pro - Complete Insurance Management System
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">{stat.change}</span> from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Renewal Reminders */}
            <RenewalReminders />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-full">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies">
            <PolicyManagement />
          </TabsContent>

          <TabsContent value="quotes">
            <QuoteManagement />
          </TabsContent>

          <TabsContent value="claims">
            <ClaimsManagement />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialManagement />
          </TabsContent>

          <TabsContent value="workflows">
            <WorkflowManager />
          </TabsContent>

          <TabsContent value="admin">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <UserManagement />
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Reports & Compliance</h2>
                <BarChart3 className="h-6 w-6 text-gray-600" />
              </div>
              <ComplianceReports />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
