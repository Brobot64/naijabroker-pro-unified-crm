import React from 'react';
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
  requiredStatus: string[];
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'notification',
    name: 'Claim Notification',
    icon: <AlertCircle className="h-4 w-4" />,
    requiredStatus: ['registered']
  },
  {
    id: 'registration',
    name: 'Claim Registration',
    icon: <FileText className="h-4 w-4" />,
    requiredStatus: ['registered']
  },
  {
    id: 'documents',
    name: 'Document Upload',
    icon: <Upload className="h-4 w-4" />,
    requiredStatus: ['registered', 'investigating']
  },
  {
    id: 'assignment',
    name: 'Underwriter Assignment',
    icon: <UserCheck className="h-4 w-4" />,
    requiredStatus: ['investigating']
  },
  {
    id: 'review',
    name: 'Claim Review',
    icon: <Search className="h-4 w-4" />,
    requiredStatus: ['investigating', 'assessed']
  },
  {
    id: 'validation',
    name: 'Claim Validation',
    icon: <CheckCircle className="h-4 w-4" />,
    requiredStatus: ['assessed', 'approved']
  },
  {
    id: 'settlement',
    name: 'Settlement Recommendation',
    icon: <DollarSign className="h-4 w-4" />,
    requiredStatus: ['approved', 'settled']
  },
  {
    id: 'feedback',
    name: 'Client Feedback',
    icon: <MessageSquare className="h-4 w-4" />,
    requiredStatus: ['settled']
  },
  {
    id: 'closure',
    name: 'Claim Closure',
    icon: <Archive className="h-4 w-4" />,
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

  return (
    <div className="w-full">
      {showTitle && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Workflow Progress</h3>
          {claimNumber && (
            <p className="text-sm text-muted-foreground mt-1">Claim: {claimNumber}</p>
          )}
        </div>
      )}

      {/* Horizontal Progress Bar */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-8 right-8 h-0.5 bg-border">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${((WORKFLOW_STAGES.findIndex(stage => getStageStatus(stage) === 'active') + 1) / WORKFLOW_STAGES.length) * 100}%`
            }}
          />
        </div>

        {/* Workflow Steps */}
        <div className="flex justify-between items-start relative">
          {WORKFLOW_STAGES.map((stage, index) => {
            const stageStatus = getStageStatus(stage);
            const isCompleted = stageStatus === 'completed';
            const isActive = stageStatus === 'active';
            const isPending = stageStatus === 'pending';
            
            return (
              <div 
                key={stage.id} 
                className="flex flex-col items-center text-center max-w-[120px]"
              >
                {/* Step Circle */}
                <div className={`
                  relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                  ${isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : ''}
                  ${isPending ? 'bg-muted text-muted-foreground border-2 border-border' : ''}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3">
                  <h4 className={`
                    text-xs font-medium leading-tight
                    ${isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    {stage.name}
                  </h4>
                  <div className="text-xs text-muted-foreground mt-1">
                    Step {index + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};