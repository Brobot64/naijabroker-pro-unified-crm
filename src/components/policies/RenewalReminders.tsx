
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Calendar, Clock, AlertTriangle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PolicyService } from "@/services/database/policyService";

interface RenewalReminder {
  id: string;
  policyNumber: string;
  client: string;
  type: string;
  expiryDate: string;
  daysToExpiry: number;
  premium: string;
  status: 'upcoming' | 'due' | 'overdue';
  remindersSent: number;
  lastReminderDate?: string;
}

export const RenewalReminders = () => {
  const [reminders, setReminders] = useState<RenewalReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExpiringPolicies();
  }, []);

  const loadExpiringPolicies = async () => {
    setLoading(true);
    try {
      const expiringPolicies = await PolicyService.getExpiringPolicies(60); // Get policies expiring in next 60 days
      
      const reminderData: RenewalReminder[] = expiringPolicies.map(policy => {
        const today = new Date();
        const expiryDate = new Date(policy.end_date);
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let status: 'upcoming' | 'due' | 'overdue';
        if (diffDays < 0) {
          status = 'overdue';
        } else if (diffDays <= 14) {
          status = 'due';
        } else {
          status = 'upcoming';
        }

        return {
          id: `REN-${policy.id}`,
          policyNumber: policy.policy_number,
          client: policy.client_name,
          type: policy.policy_type,
          expiryDate: policy.end_date,
          daysToExpiry: diffDays,
          premium: `₦${policy.premium.toLocaleString()}`,
          status,
          remindersSent: 0, // This would come from a reminders tracking table
          lastReminderDate: undefined
        };
      });

      setReminders(reminderData);
    } catch (error) {
      console.error('Failed to load expiring policies:', error);
      toast({
        title: "Error",
        description: "Failed to load renewal reminders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendRenewalReminder = async (reminder: RenewalReminder) => {
    console.log('Sending automated renewal reminder:', {
      reminderId: reminder.id,
      policyNumber: reminder.policyNumber,
      client: reminder.client,
      expiryDate: reminder.expiryDate,
      daysToExpiry: reminder.daysToExpiry,
      reminderCount: reminder.remindersSent + 1
    });

    // In a real implementation, this would call an email service
    // For now, we'll simulate the reminder
    setTimeout(() => {
      // Update reminder count
      setReminders(prevReminders =>
        prevReminders.map(r =>
          r.id === reminder.id
            ? { ...r, remindersSent: r.remindersSent + 1, lastReminderDate: new Date().toISOString().split('T')[0] }
            : r
        )
      );

      toast({
        title: "Renewal Reminder Sent",
        description: `Email reminder sent to ${reminder.client} for policy ${reminder.policyNumber}`,
      });
    }, 1000);
  };

  const processRenewal = (reminder: RenewalReminder) => {
    console.log('Processing renewal:', {
      reminderId: reminder.id,
      policyNumber: reminder.policyNumber,
      client: reminder.client,
      premium: reminder.premium
    });

    toast({
      title: "Renewal Processing",
      description: `Renewal process initiated for ${reminder.policyNumber}`,
    });
  };

  const sendBulkReminders = async () => {
    const dueReminders = reminders.filter(r => r.status === 'due' && r.remindersSent < 3);
    
    if (dueReminders.length === 0) {
      toast({
        title: "No Reminders to Send",
        description: "All due policies have already received maximum reminders",
        variant: "destructive"
      });
      return;
    }

    for (const reminder of dueReminders) {
      await sendRenewalReminder(reminder);
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    toast({
      title: "Bulk Reminders Sent",
      description: `Sent ${dueReminders.length} renewal reminders`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "due":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Calendar className="h-4 w-4" />;
      case "due":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Renewal Reminders & Automation</span>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={sendBulkReminders} className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send Bulk Reminders
            </Button>
            <Button variant="outline" onClick={loadExpiringPolicies}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p>Loading renewal reminders...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No policies requiring renewal reminders</p>
          </div>
        ) : (
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Days to Expiry</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reminders Sent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reminders.map((reminder) => (
              <TableRow key={reminder.id}>
                <TableCell className="font-medium">{reminder.policyNumber}</TableCell>
                <TableCell>{reminder.client}</TableCell>
                <TableCell>{reminder.type}</TableCell>
                <TableCell>{reminder.expiryDate}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getUrgencyIcon(reminder.status)}
                    <span className={reminder.daysToExpiry < 0 ? "text-red-600 font-semibold" : 
                                  reminder.daysToExpiry <= 14 ? "text-yellow-600 font-semibold" : ""}>
                      {reminder.daysToExpiry < 0 ? `${Math.abs(reminder.daysToExpiry)} overdue` : 
                       `${reminder.daysToExpiry} days`}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">{reminder.premium}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(reminder.status)}>
                    {reminder.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-semibold">{reminder.remindersSent}</div>
                    {reminder.lastReminderDate && (
                      <div className="text-xs text-gray-500">
                        Last: {reminder.lastReminderDate}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => sendRenewalReminder(reminder)}
                    >
                      Send Reminder
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => processRenewal(reminder)}
                    >
                      Process Renewal
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
