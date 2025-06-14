
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const PaymentSystemConfig = () => {
  const [gateways, setGateways] = useState([
    {
      id: "stripe",
      name: "Stripe",
      status: "active",
      transactionFee: "2.9% + ₦50",
      monthlyVolume: "₦2.4M",
      successRate: "99.2%"
    },
    {
      id: "paypal",
      name: "PayPal",
      status: "active", 
      transactionFee: "3.4% + ₦60",
      monthlyVolume: "₦850K",
      successRate: "98.7%"
    },
    {
      id: "paystack",
      name: "Paystack",
      status: "inactive",
      transactionFee: "1.5% + ₦40",
      monthlyVolume: "₦0",
      successRate: "N/A"
    }
  ]);

  const [billingConfig, setBillingConfig] = useState({
    defaultCycle: "monthly",
    trialDays: 14,
    gracePeriod: 7,
    dunningAttempts: 3
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Payment System Integration</h2>
        <Button>Add Payment Gateway</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦3.25M</div>
            <p className="text-xs text-muted-foreground">Monthly Volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">98.9%</div>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₦89K</div>
            <p className="text-xs text-muted-foreground">Processing Fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2.7%</div>
            <p className="text-xs text-muted-foreground">Failed Payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gateway</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction Fee</TableHead>
                <TableHead>Monthly Volume</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gateways.map((gateway) => (
                <TableRow key={gateway.id}>
                  <TableCell className="font-medium">{gateway.name}</TableCell>
                  <TableCell>
                    <Badge className={gateway.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {gateway.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{gateway.transactionFee}</TableCell>
                  <TableCell>{gateway.monthlyVolume}</TableCell>
                  <TableCell>{gateway.successRate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Configure</Button>
                      <Button size="sm" variant="outline">Test</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billingCycle">Default Billing Cycle</Label>
              <Select value={billingConfig.defaultCycle} onValueChange={(value) => setBillingConfig({...billingConfig, defaultCycle: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="trialDays">Trial Period (Days)</Label>
              <Input 
                id="trialDays"
                type="number"
                value={billingConfig.trialDays}
                onChange={(e) => setBillingConfig({...billingConfig, trialDays: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="gracePeriod">Grace Period (Days)</Label>
              <Input 
                id="gracePeriod"
                type="number"
                value={billingConfig.gracePeriod}
                onChange={(e) => setBillingConfig({...billingConfig, gracePeriod: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="dunningAttempts">Dunning Attempts</Label>
              <Input 
                id="dunningAttempts"
                type="number"
                value={billingConfig.dunningAttempts}
                onChange={(e) => setBillingConfig({...billingConfig, dunningAttempts: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <Button>Save Configuration</Button>
        </CardContent>
      </Card>
    </div>
  );
};
