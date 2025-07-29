import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle, 
  FileText, 
  Upload, 
  UserCheck, 
  Search, 
  CheckCircle, 
  DollarSign, 
  MessageSquare, 
  Archive 
} from 'lucide-react';

interface ClaimsWorkflowProgressProps {
  currentStatus: string;
  claimNumber?: string;
  showTitle?: boolean;
}

interface WorkflowStage {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  requiredStatus: string[];
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'notification',
    name: 'Claim Notification',
    icon: <AlertCircle className="h-5 w-5" />,
    description: 'Client-initiated via portal; email sent to broker + client; allows file upload',
    requiredStatus: ['registered']
  },
  {
    id: 'registration',
    name: 'Claim Registration',
    icon: <FileText className="h-5 w-5" />,
    description: 'Internal entry if not submitted via portal',
    requiredStatus: ['registered']
  },
  {
    id: 'documents',
    name: 'Document Upload',
    icon: <Upload className="h-5 w-5" />,
    description: 'Enforce mandatory docs before progressing',
    requiredStatus: ['registered', 'investigating']
  },
  {
    id: 'assignment',
    name: 'Underwriter Assignment',
    icon: <UserCheck className="h-5 w-5" />,
    description: 'Assign claim to underwriter or adjuster',
    requiredStatus: ['investigating']
  },
  {
    id: 'review',
    name: 'Claim Review',
    icon: <Search className="h-5 w-5" />,
    description: 'Investigation and assessment of claim validity',
    requiredStatus: ['investigating', 'assessed']
  },
  {
    id: 'validation',
    name: 'Claim Validation',
    icon: <CheckCircle className="h-5 w-5" />,
    description: 'Final validation and approval decision',
    requiredStatus: ['assessed', 'approved']
  },
  {
    id: 'settlement',
    name: 'Settlement Recommendation',
    icon: <DollarSign className="h-5 w-5" />,
    description: 'Settlement amount determination and processing',
    requiredStatus: ['approved', 'settled']
  },
  {
    id: 'feedback',
    name: 'Client Feedback',
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'Client confirmation and feedback collection',
    requiredStatus: ['settled']
  },
  {
    id: 'closure',
    name: 'Claim Closure',
    icon: <Archive className="h-5 w-5" />,
    description: 'Final closure and archival of claim',
    requiredStatus: ['closed']
  }
];

export const ClaimsWorkflowProgress: React.FC<ClaimsWorkflowProgressProps> = ({
  currentStatus,
  claimNumber,
  showTitle = true
}) => {
  const getStageStatus = (stage: WorkflowStage): 'completed' | 'active' | 'pending' => {
    if (stage.requiredStatus.includes(currentStatus)) {
      return 'active';
    }
    
    // Define status hierarchy for completion logic
    const statusHierarchy = [
      'registered', 'investigating', 'assessed', 'approved', 'settled', 'closed'
    ];
    
    const currentIndex = statusHierarchy.indexOf(currentStatus);
    const stageRequiredIndex = Math.max(...stage.requiredStatus.map(s => statusHierarchy.indexOf(s)));
    
    if (currentIndex > stageRequiredIndex) {
      return 'completed';
    }
    
    return 'pending';
  };

  const getStageClasses = (status: 'completed' | 'active' | 'pending') => {
    switch (status) {
      case 'completed':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-600 bg-green-100',
          text: 'text-green-800',
          badge: 'bg-green-100 text-green-800'
        };
      case 'active':
        return {
          container: 'bg-blue-50 border-blue-200 ring-2 ring-blue-200',
          icon: 'text-blue-600 bg-blue-100',
          text: 'text-blue-800',
          badge: 'bg-blue-100 text-blue-800'
        };
      case 'pending':
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-400 bg-gray-100',
          text: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-600'
        };
    }
  };

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Claims Workflow Progress</h3>
          {claimNumber && (
            <p className="text-sm text-gray-600 mt-1">Claim: {claimNumber}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WORKFLOW_STAGES.map((stage, index) => {
          const stageStatus = getStageStatus(stage);
          const classes = getStageClasses(stageStatus);
          
          return (
            <Card 
              key={stage.id} 
              className={`transition-all duration-200 ${classes.container}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${classes.icon}`}>
                      {stage.icon}
                    </div>
                    <div>
                      <CardTitle className={`text-sm font-medium ${classes.text}`}>
                        {stage.name}
                      </CardTitle>
                      <div className="text-xs text-gray-500 mt-1">
                        Step {index + 1} of {WORKFLOW_STAGES.length}
                      </div>
                    </div>
                  </div>
                  <Badge className={classes.badge} variant="secondary">
                    {stageStatus === 'completed' && '✓'}
                    {stageStatus === 'active' && '●'}
                    {stageStatus === 'pending' && '○'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-xs ${classes.text}`}>
                  {stage.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900">Current Progress</h4>
              <p className="text-xs text-blue-700 mt-1">
                Status: {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-900">
                {WORKFLOW_STAGES.filter(stage => getStageStatus(stage) === 'completed').length} / {WORKFLOW_STAGES.length}
              </div>
              <div className="text-xs text-blue-700">Stages Complete</div>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(WORKFLOW_STAGES.filter(stage => getStageStatus(stage) === 'completed').length / WORKFLOW_STAGES.length) * 100}%`
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};