
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const ComplianceReports = () => {
  const auditTrail = [
    {
      id: "AUD-001",
      timestamp: "2024-06-11 10:30:00",
      user: "John Smith",
      action: "Policy Issued",
      entity: "POL-2024-001234",
      details: "Industrial All Risk policy issued for Dangote Industries",
      ipAddress: "192.168.1.100"
    },
    {
      id: "AUD-002", 
      timestamp: "2024-06-11 09:15:00",
      user: "Mary Johnson",
      action: "Quote Generated",
      entity: "QT-2024-002",
      details: "Motor fleet quote generated for First Bank",
      ipAddress: "192.168.1.101"
    },
    {
      id: "AUD-003",
      timestamp: "2024-06-11 08:45:00",
      user: "David Wilson",
      action: "Payment Processed",
      entity: "RCP-2024-001",
      details: "Premium payment of ₦5,750,000 processed",
      ipAddress: "192.168.1.102"
    },
  ];

  const naicomReports = [
    {
      id: "NAIC-2024-06",
      reportType: "Monthly Returns",
      period: "June 2024",
      status: "ready",
      dueDate: "2024-06-30",
      generatedBy: "System Auto",
      fileSize: "2.5 MB"
    },
    {
      id: "NAIC-2024-Q2",
      reportType: "Quarterly Statement", 
      period: "Q2 2024",
      status: "pending",
      dueDate: "2024-07-15",
      generatedBy: "Pending", 
      fileSize: "N/A"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Compliance & Reports</h1>
        <Button>Generate Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Compliance Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Audit Trail Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">NAICOM Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Outstanding Issues</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit-trail" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
          <TabsTrigger value="naicom-reports">NAICOM Reports</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="data-integrity">Data Integrity</TabsTrigger>
        </TabsList>

        <TabsContent value="audit-trail">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditTrail.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-sm">{entry.timestamp}</TableCell>
                      <TableCell>{entry.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.action}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{entry.entity}</TableCell>
                      <TableCell className="max-w-md truncate">{entry.details}</TableCell>
                      <TableCell className="font-mono text-sm">{entry.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="naicom-reports">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>NAICOM Regulatory Reports</CardTitle>
                <Button>Generate New Report</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {naicomReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>{report.reportType}</TableCell>
                      <TableCell>{report.period}</TableCell>
                      <TableCell>
                        <Badge className={report.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.dueDate}</TableCell>
                      <TableCell>{report.fileSize}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Download</Button>
                          <Button size="sm">Submit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-analysis">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Risk analysis reports and dashboards will be displayed here.</p>
                <p className="text-sm mt-2">Includes portfolio concentration, geographic distribution, and industry exposure analysis.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-integrity">
          <Card>
            <CardHeader>
              <CardTitle>Data Integrity Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-green-800">Policy Data Validation</h4>
                    <p className="text-sm text-green-600">All policy records pass integrity checks</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">PASSED</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-green-800">Financial Records Reconciliation</h4>
                    <p className="text-sm text-green-600">All financial transactions balanced</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">PASSED</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-green-800">Duplicate Prevention</h4>
                    <p className="text-sm text-green-600">No duplicate entries detected</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">PASSED</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
