
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Link, 
  Bell, 
  Shield,
  Database,
  Palette,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap
} from "lucide-react";

export const SocialSettings = () => {
  const [notifications, setNotifications] = useState({
    mentions: true,
    comments: true,
    messages: true,
    scheduled: false,
    reports: true
  });

  const connectedAccounts = [
    { 
      platform: "Facebook", 
      status: "connected", 
      account: "@NaijaBrokerPro", 
      expires: "2024-12-31",
      permissions: ["publish_posts", "read_insights", "manage_pages"]
    },
    { 
      platform: "Instagram", 
      status: "connected", 
      account: "@naijabroker.pro", 
      expires: "2024-12-31",
      permissions: ["publish_posts", "read_insights", "manage_comments"]
    },
    { 
      platform: "Twitter", 
      status: "connected", 
      account: "@NaijaBrokerPro", 
      expires: "Never",
      permissions: ["tweet", "read", "dm"]
    },
    { 
      platform: "LinkedIn", 
      status: "connected", 
      account: "NaijaBroker Pro", 
      expires: "2024-11-15",
      permissions: ["share", "read_company", "manage_company"]
    },
    { 
      platform: "TikTok", 
      status: "disconnected", 
      account: "", 
      expires: "",
      permissions: []
    },
    { 
      platform: "YouTube", 
      status: "pending", 
      account: "NaijaBroker Pro", 
      expires: "",
      permissions: []
    }
  ];

  const automationRules = [
    {
      name: "Auto-respond to common questions",
      description: "Automatically respond to frequently asked questions",
      active: true,
      triggers: ["insurance quote", "contact info", "business hours"]
    },
    {
      name: "Tag urgent messages",
      description: "Flag messages containing urgent keywords",
      active: true,
      triggers: ["urgent", "emergency", "asap", "immediately"]
    },
    {
      name: "Schedule optimal posting times",
      description: "Automatically schedule posts for peak engagement",
      active: false,
      triggers: ["schedule", "post"]
    }
  ];

  const brandGuidelines = {
    primaryColor: "#2563eb",
    secondaryColor: "#64748b",
    logo: "/api/placeholder/150/50",
    tone: "Professional yet approachable",
    hashtags: ["#NaijaBroker", "#InsuranceExperts", "#TrustWorthy"],
    doNotUse: ["Aggressive sales language", "Unverified claims", "Competitor mentions"]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "disconnected": return "bg-red-100 text-red-800";
      case "expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Media Settings</h2>
          <p className="text-gray-600">Configure your social media management preferences</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Database className="w-4 h-4 mr-2" />
            Export Settings
          </Button>
          <Button>
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="branding">Brand Guidelines</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link className="h-5 w-5" />
                <span>Platform Connections</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedAccounts.map((account, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium">{account.platform[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium">{account.platform}</div>
                          <div className="text-sm text-gray-600">{account.account}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(account.status)}>
                          {account.status}
                        </Badge>
                        {account.status === 'connected' ? (
                          <Button size="sm" variant="outline">Disconnect</Button>
                        ) : (
                          <Button size="sm">Connect</Button>
                        )}
                      </div>
                    </div>

                    {account.status === 'connected' && (
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-500">Expires</div>
                          <div className="text-sm">{account.expires}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Permissions</div>
                          <div className="text-sm">{account.permissions.length} granted</div>
                        </div>
                      </div>
                    )}

                    {account.permissions.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-2">Permissions</div>
                        <div className="flex flex-wrap gap-1">
                          {account.permissions.map((permission, permIndex) => (
                            <Badge key={permIndex} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Mentions & Tags</div>
                    <div className="text-sm text-gray-600">Get notified when someone mentions your account</div>
                  </div>
                  <Switch 
                    checked={notifications.mentions}
                    onCheckedChange={(checked) => setNotifications(prev => ({...prev, mentions: checked}))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Comments</div>
                    <div className="text-sm text-gray-600">Notifications for new comments on your posts</div>
                  </div>
                  <Switch 
                    checked={notifications.comments}
                    onCheckedChange={(checked) => setNotifications(prev => ({...prev, comments: checked}))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Direct Messages</div>
                    <div className="text-sm text-gray-600">Get notified of new direct messages</div>
                  </div>
                  <Switch 
                    checked={notifications.messages}
                    onCheckedChange={(checked) => setNotifications(prev => ({...prev, messages: checked}))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Scheduled Posts</div>
                    <div className="text-sm text-gray-600">Confirmation when scheduled posts are published</div>
                  </div>
                  <Switch 
                    checked={notifications.scheduled}
                    onCheckedChange={(checked) => setNotifications(prev => ({...prev, scheduled: checked}))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Weekly Reports</div>
                    <div className="text-sm text-gray-600">Receive weekly performance reports</div>
                  </div>
                  <Switch 
                    checked={notifications.reports}
                    onCheckedChange={(checked) => setNotifications(prev => ({...prev, reports: checked}))}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <Label htmlFor="email">Notification Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="notifications@naijabroker.com"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Automation Rules</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-gray-600">{rule.description}</div>
                      </div>
                      <Switch 
                        checked={rule.active}
                        onCheckedChange={() => {/* Handle toggle */}}
                      />
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 mb-2">Triggers</div>
                      <div className="flex flex-wrap gap-1">
                        {rule.triggers.map((trigger, triggerIndex) => (
                          <Badge key={triggerIndex} variant="outline" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Brand Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input 
                      id="primary-color"
                      type="color" 
                      value={brandGuidelines.primaryColor}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      type="text" 
                      value={brandGuidelines.primaryColor}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input 
                      id="secondary-color"
                      type="color" 
                      value={brandGuidelines.secondaryColor}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      type="text" 
                      value={brandGuidelines.secondaryColor}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Brand Hashtags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {brandGuidelines.hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="outline">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="tone">Brand Tone</Label>
                <Input 
                  id="tone"
                  value={brandGuidelines.tone}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Content Guidelines</Label>
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm font-medium text-red-800 mb-2">Do Not Use:</div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {brandGuidelines.doNotUse.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600">Add an extra layer of security</div>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">API Access Logs</div>
                    <div className="text-sm text-gray-600">Monitor API access to your accounts</div>
                  </div>
                  <Button variant="outline">View Logs</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Data Backup</div>
                    <div className="text-sm text-gray-600">Regular backup of your social media data</div>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">Security Recommendations</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      • Review connected app permissions regularly<br />
                      • Use strong, unique passwords for all accounts<br />
                      • Enable 2FA on all social media platforms
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
