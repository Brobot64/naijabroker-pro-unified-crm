
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const SubscriptionManager = () => {
  const [plans, setPlans] = useState([
    {
      id: "basic",
      name: "Basic Plan",
      price: 2500,
      subscribers: 245,
      features: ["5 Users", "Basic Reports", "Email Support"],
      status: "active"
    },
    {
      id: "premium",
      name: "Premium Plan", 
      price: 7500,
      subscribers: 432,
      features: ["25 Users", "Advanced Reports", "Priority Support", "API Access"],
      status: "active"
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: 15000,
      subscribers: 170,
      features: ["Unlimited Users", "Custom Reports", "Dedicated Support", "White Label"],
      status: "active"
    }
  ]);

  const [newPlan, setNewPlan] = useState({
    name: "",
    price: 0,
    features: [],
    maxUsers: 0,
    apiAccess: false,
    whiteLabel: false
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Subscription Plan Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create New Plan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Subscription Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="planName">Plan Name</Label>
                <Input 
                  id="planName"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                  placeholder="e.g. Professional Plan"
                />
              </div>
              <div>
                <Label htmlFor="planPrice">Monthly Price (₦)</Label>
                <Input 
                  id="planPrice"
                  type="number"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({...newPlan, price: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="maxUsers">Max Users</Label>
                <Input 
                  id="maxUsers"
                  type="number"
                  value={newPlan.maxUsers}
                  onChange={(e) => setNewPlan({...newPlan, maxUsers: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="apiAccess"
                  checked={newPlan.apiAccess}
                  onCheckedChange={(checked) => setNewPlan({...newPlan, apiAccess: checked})}
                />
                <Label htmlFor="apiAccess">API Access</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="whiteLabel"
                  checked={newPlan.whiteLabel}
                  onCheckedChange={(checked) => setNewPlan({...newPlan, whiteLabel: checked})}
                />
                <Label htmlFor="whiteLabel">White Label</Label>
              </div>
              <Button className="w-full">Create Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground">Total Subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦5.2M</div>
            <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2.3%</div>
            <p className="text-xs text-muted-foreground">Monthly Churn Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>₦{plan.price.toLocaleString()}/mo</TableCell>
                  <TableCell>{plan.subscribers}</TableCell>
                  <TableCell>₦{(plan.price * plan.subscribers).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {plan.features.slice(0, 2).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {plan.features.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.features.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">{plan.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Analytics</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
