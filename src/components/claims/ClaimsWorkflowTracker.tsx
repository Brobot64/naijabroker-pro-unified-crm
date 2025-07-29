import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, FileText, Search, Gavel, DollarSign, CheckSquare } from "lucide-react";

interface ClaimsWorkflowTrackerProps {
  currentStatus: string;
  claimNumber: string;
  clientName: string;
  estimatedLoss: number;
  createdAt: string;
}

export const ClaimsWorkflowTracker = ({
  currentStatus,
  claimNumber,
  clientName,
  estimatedLoss,
  createdAt
}: ClaimsWorkflowTrackerProps) => {
  const workflowSteps = [
    {
      id: 'registered',
      title: 'Registered',
      description: 'Claim submitted and logged',
      icon: FileText
    },
    {
      id: 'investigating',
      title: 'Investigation',
      description: 'Adjuster assigned and investigating',
      icon: Search
    },
    {
      id: 'assessed',
      title: 'Assessed',
      description: 'Loss assessment completed',
      icon: Gavel
    },
    {
      id: 'approved',
      title: 'Approved',
      description: 'Claim approved for settlement',
      icon: CheckCircle
    },
    {
      id: 'settled',
      title: 'Settled',
      description: 'Payment processed',
      icon: DollarSign
    },
    {
      id: 'closed',
      title: 'Closed',
      description: 'Claim file closed',
      icon: CheckSquare
    }
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = workflowSteps.findIndex(step => step.id === stepId);
    const currentIndex = workflowSteps.findIndex(step => step.id === currentStatus);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepIcon = (step: any, status: string) => {
    const IconComponent = step.icon;
    
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (status === 'current') {
      return <Clock className="h-5 w-5 text-blue-600" />;
    } else {
      return <IconComponent className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'current':
        return 'bg-blue-100 border-blue-300';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Claims Workflow Progress</CardTitle>
          <Badge variant="outline">{claimNumber}</Badge>
        </div>
        <div className="text-sm text-gray-600">
          <p><strong>Client:</strong> {clientName}</p>
          <p><strong>Estimated Loss:</strong> ₦{estimatedLoss.toLocaleString()}</p>
          <p><strong>Registered:</strong> {new Date(createdAt).toLocaleDateString()}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflowSteps.map((step, index) => {
            const status = getStepStatus(step.id);
            
            return (
              <div key={step.id} className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getStepColor(status)}`}>
                  {getStepIcon(step, status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-medium ${status === 'current' ? 'text-blue-600' : status === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </h4>
                    {status === 'current' && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
                
                {index < workflowSteps.length - 1 && (
                  <div className={`w-px h-8 ${status === 'completed' ? 'bg-green-300' : 'bg-gray-300'} ml-5`} />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-2">Status Information</h5>
          <div className="text-sm text-gray-600">
            {currentStatus === 'registered' && (
              <p>Claim has been registered and is pending adjuster assignment for investigation.</p>
            )}
            {currentStatus === 'investigating' && (
              <p>An adjuster has been assigned and is currently investigating the claim details.</p>
            )}
            {currentStatus === 'assessed' && (
              <p>Investigation is complete. Loss assessment has been conducted and is under review.</p>
            )}
            {currentStatus === 'approved' && (
              <p>Claim has been approved for settlement. Payment processing will begin shortly.</p>
            )}
            {currentStatus === 'settled' && (
              <p>Settlement payment has been processed. Claim is ready for closure.</p>
            )}
            {currentStatus === 'closed' && (
              <p>Claim has been fully processed and the file is now closed.</p>
            )}
            {currentStatus === 'rejected' && (
              <p className="text-red-600">Claim has been rejected. Please review rejection details for more information.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};