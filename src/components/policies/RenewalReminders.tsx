
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { workflowManager } from "@/utils/workflowManager";

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
  const { toast } = useToast();

  // Sample renewal reminders data
  useEffect(() => {
    const mockReminders: RenewalReminder[] = [
      {
        id: "REN-2024-001",
        policyNumber: "POL-2024-001234",
        client: "Dangote Industries Ltd",
        type: "Industrial All Risks",
        expiryDate: "2024-07-15",
        daysToExpiry: 29,
        premium: "₦2,500,000",
        status: "upcoming",
        remindersSent: 0
      },
      {
        id: "REN-2024-002",
        policyNumber: "POL-2024-001236",
        client: "First Bank Plc",
        type: "Motor Fleet",
        expiryDate: "2024-06-14",
        daysToExpiry: -2,
        premium: "₦750,000",
        status: "overdue",
        remindersSent: 3,
        lastReminderDate: "2024-06-16"
      },
      {
        id: "REN-2024-003",
        policyNumber: "POL-2024-001237",
        client: "GTBank Plc",
        type: "Bankers Blanket Bond",
        expiryDate: "2024-06-30",
        daysToExpiry: 14,
        premium: "₦5,000,000",
        status: "due",
        remindersSent: 1,
        lastReminderDate: "2024-06-10"
      }
    ];
    setReminders(mockReminders);
  }, []);

  const sendRenewalReminder = (reminder: RenewalReminder) => {
    console.log('Sending automated renewal reminder:', {
      reminderId: reminder.id,
      policyNumber: reminder.policyNumber,
      client: reminder.client,
      expiryDate: reminder.expiryDate,
      daysToExpiry: reminder.daysToExpiry,
      reminderCount: reminder.remindersSent + 1
    });

    // Generate notification using workflow manager
    const notification = workflowManager.generateNotification('policy_renewal', {
      policyNumber: reminder.policyNumber,
      clientEmail: 'client@example.com',
      expiryDate: reminder.expiryDate,
      clientName: reminder.client
    });

    console.log('Generated renewal notification:', notification);

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
      description: `Reminder sent to ${reminder.client} for policy ${reminder.policyNumber}`,
    });
  };

  const processRenewal = (reminder: RenewalReminder) => {
    console.log('Processing renewal with approval routing:', {
      reminderId: reminder.id,
      policyNumber: reminder.policyNumber,
      client: reminder.client,
      premium: reminder.premium,
      approvalRequired: workflowManager.requiresApproval('underwriting', 2500000, 'Agent')
    });

    toast({
      title: "Renewal Processing",
      description: `Renewal process initiated for ${reminder.policyNumber}. Routing to appropriate approver.`,
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
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Automated Renewal Reminders & Approval Routing</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
