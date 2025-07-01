
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientOnboarding } from "./ClientOnboarding";
import { QuoteIntakeDrafting } from "./QuoteIntakeDrafting";
import { ClauseRecommendation } from "./ClauseRecommendation";
import { RFQGeneration } from "./RFQGeneration";
import { InsurerMatching } from "./InsurerMatching";
import { QuoteEvaluation } from "./QuoteEvaluation";
import { ClientSelection } from "./ClientSelection";
import { PaymentProcessing } from "./PaymentProcessing";
import { ContractGeneration } from "./ContractGeneration";
import { 
  Users, 
  FileText, 
  Lightbulb, 
  Send, 
  Building, 
  BarChart3, 
  CheckCircle, 
  CreditCard, 
  FileCheck,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

type WorkflowStep = 
  | 'client-onboarding'
  | 'quote-drafting'
  | 'clause-recommendation'
  | 'rfq-generation'
  | 'insurer-matching'
  | 'quote-evaluation'
  | 'client-selection'
  | 'payment-processing'
  | 'contract-generation';

interface WorkflowData {
  client?: any;
  quote?: any;
  clauses?: any[];
  rfq?: any;
  insurerMatches?: any[];
  quotes?: any[];
  clientSelection?: any;
  payment?: any;
  contracts?: any;
}

export const QuoteManagementWorkflow = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('client-onboarding');
  const [workflowData, setWorkflowData] = useState<WorkflowData>({});
  const [completedSteps, setCompletedSteps] = useState<Set<WorkflowStep>>(new Set());

  const steps = [
    { id: 'client-onboarding', name: 'Client Onboarding', icon: Users, description: 'Register new client or select existing' },
    { id: 'quote-drafting', name: 'Quote Drafting', icon: FileText, description: 'Create quote with financial calculations' },
    { id: 'clause-recommendation', name: 'Clause & Add-ons', icon: Lightbulb, description: 'Select policy clauses and recommendations' },
    { id: 'rfq-generation', name: 'RFQ Generation', icon: Send, description: 'Generate and preview RFQ document' },
    { id: 'insurer-matching', name: 'Insurer Matching', icon: Building, description: 'Match and dispatch to insurers' },
    { id: 'quote-evaluation', name: 'Quote Evaluation', icon: BarChart3, description: 'Collect and evaluate insurer responses' },
    { id: 'client-selection', name: 'Client Selection', icon: CheckCircle, description: 'Client reviews and selects preferred option' },
    { id: 'payment-processing', name: 'Payment', icon: CreditCard, description: 'Process premium payment' },
    { id: 'contract-generation', name: 'Contract Generation', icon: FileCheck, description: 'Generate interim and final contracts' }
  ] as const;

  const handleStepComplete = (stepId: WorkflowStep, data: any) => {
    setWorkflowData(prev => ({ ...prev, [stepId.replace('-', '')]: data }));
    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    // Auto-advance to next step
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as WorkflowStep);
    }
  };

  const navigateToStep = (stepId: WorkflowStep) => {
    setCurrentStep(stepId);
  };

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);

  const canNavigateToStep = (stepId: WorkflowStep) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = getCurrentStepIndex();
    
    // Can navigate to current step, previous steps, or next immediate step
    return stepIndex <= currentIndex + 1 || completedSteps.has(stepId);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'client-onboarding':
        return (
          <ClientOnboarding
            onClientSelected={(client) => 
              handleStepComplete('client-onboarding', client)
            }
            onBack={() => {/* Handle cancel */}}
          />
        );
      
      case 'quote-drafting':
        return (
          <QuoteIntakeDrafting
            clientData={workflowData.client}
            onQuoteSaved={(quoteData) => 
              handleStepComplete('quote-drafting', quoteData)
            }
            onBack={() => navigateToStep('client-onboarding')}
          />
        );
      
      case 'clause-recommendation':
        return (
          <ClauseRecommendation
            quoteData={workflowData.quote}
            onClausesSelected={(clauses) => 
              handleStepComplete('clause-recommendation', clauses)
            }
            onBack={() => navigateToStep('quote-drafting')}
          />
        );
      
      case 'rfq-generation':
        return (
          <RFQGeneration
            quoteData={workflowData.quote}
            clauses={workflowData.clauses}
            onRFQGenerated={(rfqData) => 
              handleStepComplete('rfq-generation', rfqData)
            }
            onBack={() => navigateToStep('clause-recommendation')}
          />
        );
      
      case 'insurer-matching':
        return (
          <InsurerMatching
            rfqData={workflowData.rfq}
            onMatchingComplete={(matches) => 
              handleStepComplete('insurer-matching', matches)
            }
            onBack={() => navigateToStep('rfq-generation')}
          />
        );
      
      case 'quote-evaluation':
        return (
          <QuoteEvaluation
            insurerMatches={workflowData.insurerMatches}
            onEvaluationComplete={(evaluatedQuotes) => 
              handleStepComplete('quote-evaluation', evaluatedQuotes)
            }
            onBack={() => navigateToStep('insurer-matching')}
          />
        );
      
      case 'client-selection':
        return (
          <ClientSelection
            evaluatedQuotes={workflowData.quotes}
            clientData={workflowData.client}
            onSelectionComplete={(selection) => 
              handleStepComplete('client-selection', selection)
            }
            onBack={() => navigateToStep('quote-evaluation')}
          />
        );
      
      case 'payment-processing':
        return (
          <PaymentProcessing
            selectedQuote={workflowData.clientSelection}
            clientData={workflowData.client}
            onPaymentComplete={(paymentData) => 
              handleStepComplete('payment-processing', paymentData)
            }
            onBack={() => navigateToStep('client-selection')}
          />
        );
      
      case 'contract-generation':
        return (
          <ContractGeneration
            paymentData={workflowData.payment}
            selectedQuote={workflowData.clientSelection}
            clientData={workflowData.client}
            onContractsGenerated={(contracts) => 
              handleStepComplete('contract-generation', contracts)
            }
            onBack={() => navigateToStep('payment-processing')}
          />
        );
      
      default:
        return <div>Step not implemented</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quote Management Workflow</h1>
        <Badge variant="outline">
          Step {getCurrentStepIndex() + 1} of {steps.length}
        </Badge>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = completedSteps.has(step.id as WorkflowStep);
              const canNavigate = canNavigateToStep(step.id as WorkflowStep);
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <Button
                      variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
                      size="sm"
                      className={`w-12 h-12 rounded-full p-0 ${!canNavigate ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => canNavigate && navigateToStep(step.id as WorkflowStep)}
                      disabled={!canNavigate}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                    <span className={`text-xs mt-2 text-center max-w-20 ${isActive ? 'font-semibold' : ''}`}>
                      {step.name}
                    </span>
                    {isCompleted && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        ✓
                      </Badge>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <div className="min-h-[600px]">
        {renderStepContent()}
      </div>

      {/* Workflow Data Summary (for development) */}
      {Object.keys(workflowData).length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Workflow Data Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-40">
              {JSON.stringify(workflowData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
