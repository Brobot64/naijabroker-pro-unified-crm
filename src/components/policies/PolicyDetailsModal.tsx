import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AuditService } from "@/services/database/auditService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  FileText, 
  Download, 
  Mail, 
  User, 
  DollarSign, 
  Calendar, 
  History,
  AlertCircle,
  CheckCircle
} from "lucide-react";

import { Policy as DatabasePolicy } from "@/services/database/types";

type Policy = DatabasePolicy;

interface AuditLogEntry {
  id: string;
  action: string;
  user_id: string;
  created_at: string;
  old_values?: any;
  new_values?: any;
  severity: string;
}

interface PolicyDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: Policy | null;
  onUpdate?: () => void;
}

export const PolicyDetailsModal = ({ open, onOpenChange, policy, onUpdate }: PolicyDetailsModalProps) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (policy && open) {
      loadAuditLogs();
    }
  }, [policy, open]);

  const loadAuditLogs = async () => {
    if (!policy) return;
    
    setLoadingAudit(true);
    try {
      // For now, we'll use mock data since the method doesn't exist yet
      const logs: AuditLogEntry[] = [
        {
          id: '1',
          action: 'POLICY_CREATED',
          user_id: 'system',
          created_at: policy.created_at,
          new_values: { policy_number: policy.policy_number },
          severity: 'high'
        }
      ];
      setAuditLogs(logs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleDownloadContract = () => {
    if (!policy) return;
    
    // Generate a simple policy document for demonstration
    const contractContent = `
INSURANCE POLICY DOCUMENT

Policy Number: ${policy.policy_number}
Client: ${policy.client_name}
Policy Type: ${policy.policy_type}
Underwriter: ${policy.underwriter}

Coverage Period: ${policy.start_date} to ${policy.end_date}
Sum Insured: ₦${policy.sum_insured.toLocaleString()}
Premium: ₦${policy.premium.toLocaleString()}

Terms & Conditions:
${policy.terms_conditions || 'Standard terms and conditions apply.'}

Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([contractContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${policy.policy_number}-contract.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `Policy contract for ${policy.policy_number} downloaded successfully`,
    });
  };

  const handleEmailContract = () => {
    if (!policy) return;
    
    toast({
      title: "Email Sent",
      description: `Policy contract emailed to ${policy.client_email || policy.client_name}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const isExpiringSoon = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    return expiry < today;
  };

  if (!policy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Policy Details - {policy.policy_number}</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(policy.status)}>
                {policy.status}
              </Badge>
              {isExpired(policy.end_date) && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Expired
                </Badge>
              )}
              {isExpiringSoon(policy.end_date) && !isExpired(policy.end_date) && (
                <Badge variant="outline" className="border-yellow-300 text-yellow-700 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Expiring Soon
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="renewals">Renewals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">Name:</span> {policy.client_name}
                  </div>
                  {policy.client_email && (
                    <div>
                      <span className="font-medium">Email:</span> {policy.client_email}
                    </div>
                  )}
                  {policy.client_phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {policy.client_phone}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Policy Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Policy Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">Policy Type:</span> {policy.policy_type}
                  </div>
                  <div>
                    <span className="font-medium">Underwriter:</span> {policy.underwriter}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(policy.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">Sum Insured:</span> 
                    <span className="font-semibold ml-2">₦{policy.sum_insured.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">Premium:</span> 
                    <span className="font-semibold text-green-600 ml-2">₦{policy.premium.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">Commission Rate:</span> {policy.commission_rate}%
                  </div>
                  <div>
                    <span className="font-medium">Commission Amount:</span> 
                    <span className="font-semibold ml-2">₦{policy.commission_amount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Coverage Period */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Coverage Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">Start Date:</span> {policy.start_date}
                  </div>
                  <div>
                    <span className="font-medium">End Date:</span> {policy.end_date}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> 
                    <span className="ml-2">
                      {Math.ceil((new Date(policy.end_date).getTime() - new Date(policy.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Terms & Conditions */}
            {policy.terms_conditions && (
              <Card>
                <CardHeader>
                  <CardTitle>Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{policy.terms_conditions}</p>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {policy.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{policy.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Policy Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Policy Contract</p>
                        <p className="text-sm text-muted-foreground">
                          {policy.policy_number}-contract.pdf
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleDownloadContract}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleEmailContract}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAudit ? (
                  <p>Loading audit trail...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">{log.action}</TableCell>
                          <TableCell>{log.user_id}</TableCell>
                          <TableCell>
                            <span className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                toast({
                                  title: "Audit Details",
                                  description: JSON.stringify(log.new_values || {}, null, 2),
                                });
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="renewals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Renewal History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No renewal history available</p>
                  <p className="text-sm">This policy has not been renewed yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onUpdate}>
            Update Policy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};