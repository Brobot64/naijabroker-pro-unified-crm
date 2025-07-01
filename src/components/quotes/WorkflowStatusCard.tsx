
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, User } from "lucide-react";

interface WorkflowStatusCardProps {
  quoteId: string;
  currentStage: string;
  status: string;
  clientName: string;
  assignedTo?: string;
  lastUpdated: string;
  onViewDetails: () => void;
}

export const WorkflowStatusCard = ({
  quoteId,
  currentStage,
  status,
  clientName,
  assignedTo,
  lastUpdated,
  onViewDetails
}: WorkflowStatusCardProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{clientName}</CardTitle>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{status}</span>
          </Badge>
        </div>
        <p className="text-sm text-gray-600">Quote #{quoteId}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Stage:</span>
          <Badge variant="outline">{currentStage}</Badge>
        </div>
        
        {assignedTo && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Assigned to: {assignedTo}</span>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          Last updated: {new Date(lastUpdated).toLocaleDateString()}
        </div>
        
        <Button 
          onClick={onViewDetails}
          className="w-full mt-3"
          variant="outline"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
