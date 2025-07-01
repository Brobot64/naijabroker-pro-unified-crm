
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Shield,
  CheckCircle,
  Clock,
  UserCheck,
  Settings,
  BarChart3
} from "lucide-react";

export const TeamManagement = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);

  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@naijabroker.com",
      role: "Social Media Manager",
      permissions: ["create", "schedule", "publish", "respond", "analytics"],
      status: "active",
      lastActive: "2 hours ago",
      postsThisMonth: 45,
      avgResponseTime: "1.2 hours"
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike@naijabroker.com",
      role: "Content Creator",
      permissions: ["create", "schedule"],
      status: "active",
      lastActive: "30 minutes ago",
      postsThisMonth: 32,
      avgResponseTime: "N/A"
    },
    {
      id: 3,
      name: "Emma Wilson",
      email: "emma@naijabroker.com",
      role: "Community Manager",
      permissions: ["respond", "moderate"],
      status: "active",
      lastActive: "5 minutes ago",
      postsThisMonth: 12,
      avgResponseTime: "0.8 hours"
    },
    {
      id: 4,
      name: "John Smith",
      email: "john@naijabroker.com",
      role: "Analyst",
      permissions: ["analytics", "reports"],
      status: "inactive",
      lastActive: "3 days ago",
      postsThisMonth: 5,
      avgResponseTime: "N/A"
    }
  ];

  const roleTemplates = [
    {
      name: "Social Media Manager",
      permissions: ["create", "schedule", "publish", "respond", "analytics", "team"],
      description: "Full access to all social media functions"
    },
    {
      name: "Content Creator",
      permissions: ["create", "schedule"],
      description: "Can create and schedule content"
    },
    {
      name: "Community Manager",
      permissions: ["respond", "moderate"],
      description: "Manages community interactions"
    },
    {
      name: "Analyst",
      permissions: ["analytics", "reports"],
      description: "View analytics and generate reports"
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      name: "Content Creation",
      assignedTo: "Mike Chen",
      status: "active",
      description: "Create engaging social media content"
    },
    {
      step: 2,
      name: "Content Review",
      assignedTo: "Sarah Johnson",
      status: "pending",
      description: "Review and approve content for brand consistency"
    },
    {
      step: 3,
      name: "Scheduling",
      assignedTo: "Sarah Johnson",
      status: "pending",
      description: "Schedule approved content for optimal posting times"
    },
    {
      step: 4,
      name: "Publishing",
      assignedTo: "Automated",
      status: "automated",
      description: "Automatically publish scheduled content"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "create": return "✏️";
      case "schedule": return "📅";
      case "publish": return "📢";
      case "respond": return "💬";
      case "analytics": return "📊";
      case "team": return "👥";
      case "moderate": return "🛡️";
      case "reports": return "📈";
      default: return "⚙️";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600">Manage team members and workflow approvals</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Workflow Settings
          </Button>
          <Button onClick={() => setShowInviteModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Members</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-gray-500">Role</div>
                        <div className="text-sm font-medium">{member.role}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Last Active</div>
                        <div className="text-sm">{member.lastActive}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Posts This Month</div>
                        <div className="text-sm font-medium">{member.postsThisMonth}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Avg Response Time</div>
                        <div className="text-sm">{member.avgResponseTime}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-2">Permissions</div>
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {getPermissionIcon(permission)} {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Role Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Role Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roleTemplates.map((role, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium text-sm mb-1">{role.name}</div>
                    <div className="text-xs text-gray-600 mb-2">{role.description}</div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission, permIndex) => (
                        <Badge key={permIndex} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Team Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Posts</span>
                  <span className="font-medium">94</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="font-medium">1.0 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Members</span>
                  <span className="font-medium text-green-600">3/4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Approval Rate</span>
                  <span className="font-medium">96%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Approval Workflow</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflowSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      step.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      step.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{step.name}</div>
                      <div className="text-xs text-gray-600">{step.assignedTo}</div>
                    </div>
                    {step.status === 'active' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {step.status === 'pending' && <Clock className="w-4 h-4 text-yellow-600" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
