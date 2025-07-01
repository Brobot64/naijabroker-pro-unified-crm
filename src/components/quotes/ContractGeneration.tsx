
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Download, Send, CheckCircle, AlertTriangle } from "lucide-react";

interface ContractGenerationProps {
  paymentData: any;
  selectedQuote: any;
  clientData: any;
  onContractsGenerated: (contracts: any) => void;
  onBack: () => void;
}

export const ContractGeneration = ({ paymentData, selectedQuote, clientData, onContractsGenerated, onBack }: ContractGenerationProps) => {
  const [interimGenerated, setInterimGenerated] = useState(false);
  const [finalReceived, setFinalReceived] = useState(false);
  const [complianceChecked, setComplianceChecked] = useState(false);
  const [deviations, setDeviations] = useState<string[]>([]);

  const generateInterimContract = () => {
    setTimeout(() => {
      setInterimGenerated(true);
      
      // Simulate contract generation
      const contracts = {
        interim: {
          id: `INT-${Date.now()}`,
          generatedAt: new Date().toISOString(),
          documentUrl: '#',
          status: 'generated'
        }
      };
      
      onContractsGenerated(contracts);
    }, 2000);
  };

  const simulateFinalContract = () => {
    setFinalReceived(true);
    
    // Simulate compliance check
    setTimeout(() => {
      setComplianceChecked(true);
      // Simulate some minor deviations
      setDeviations(['Premium rate adjusted from 2.5% to 2.4%', 'Coverage period extended by 1 day']);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Contract Generation & Compliance</h2>
        </div>
      </div>

      {/* Contract Generation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Generation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Interim Contract */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Interim Contract
                </h4>
                {interimGenerated ? (
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Generated
                  </Badge>
                ) : (
                  <Button onClick={generateInterimContract}>
                    Generate Interim Contract
                  </Button>
                )}
              </div>
              
              {interimGenerated && (
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-green-800">
                      Interim contract generated automatically using insurer template
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Email to Client
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Final Contract */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Final Policy Document
                </h4>
                {finalReceived ? (
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Received
                  </Badge>
                ) : (
                  <div className="flex gap-2">
                    <Badge variant="outline">Pending from Insurer</Badge>
                    <Button variant="outline" size="sm" onClick={simulateFinalContract}>
                      Simulate Receipt
                    </Button>
                  </div>
                )}
              </div>
              
              {finalReceived && (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-blue-800">
                      Final policy document received from {selectedQuote.insurerName}
                    </p>
                  </div>
                  
                  {/* Compliance Check */}
                  {complianceChecked && (
                    <div className="border-t pt-3">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Compliance Check Complete
                      </h5>
                      
                      {deviations.length > 0 ? (
                        <div className="bg-yellow-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium text-yellow-800">Minor Deviations Found</span>
                          </div>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {deviations.map((deviation, index) => (
                              <li key={index}>• {deviation}</li>
                            ))}
                          </ul>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline">
                              Approve Deviations
                            </Button>
                            <Button size="sm" variant="outline">
                              Request Clarification
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm text-green-800">
                            No deviations found. Final contract matches original terms.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Details */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Client:</span>
              <p className="font-semibold">{clientData.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Insurer:</span>
              <p className="font-semibold">{selectedQuote.insurerName}</p>
            </div>
            <div>
              <span className="text-gray-600">Premium:</span>
              <p className="font-semibold">₦{selectedQuote.premium.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600">Sum Insured:</span>
              <p className="font-semibold">₦{selectedQuote.sumInsured.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600">Payment Status:</span>
              <Badge variant="secondary">Paid</Badge>
            </div>
            <div>
              <span className="text-gray-600">Transaction ID:</span>
              <p className="font-mono text-xs">{paymentData.transactionId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications & Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Quote created</span>
              <span className="text-gray-500">2 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span>RFQ dispatched to insurers</span>
              <span className="text-gray-500">1.5 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span>Quotes received and evaluated</span>
              <span className="text-gray-500">45 minutes ago</span>
            </div>
            <div className="flex justify-between">
              <span>Client selection confirmed</span>
              <span className="text-gray-500">20 minutes ago</span>
            </div>
            <div className="flex justify-between">
              <span>Payment processed</span>
              <span className="text-gray-500">10 minutes ago</span>
            </div>
            {interimGenerated && (
              <div className="flex justify-between">
                <span>Interim contract generated</span>
                <span className="text-gray-500">Just now</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      {interimGenerated && finalReceived && complianceChecked && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Quote Process Complete!
              </h3>
              <p className="text-green-600">
                All contracts have been generated and compliance checks completed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
