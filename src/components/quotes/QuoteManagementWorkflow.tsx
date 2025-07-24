
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkflowContext } from './QuoteWorkflowProvider';
import { QuoteEditModeSelector } from './QuoteEditModeSelector';
import { ClientOnboardingEnhanced } from './enhanced/ClientOnboardingEnhanced';
import { QuoteIntakeDraftingEnhanced } from './enhanced/QuoteIntakeDraftingEnhanced';
import { RFQGenerationEnhanced } from './enhanced/RFQGenerationEnhanced';
import { InsurerMatchingEnhanced } from './enhanced/InsurerMatchingEnhanced';
import { QuoteEvaluationEnhanced } from './enhanced/QuoteEvaluationEnhanced';
import { ClauseRecommendationEnhanced } from "./enhanced/ClauseRecommendationEnhanced";
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
  RefreshCw
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

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  policy_type: string;
  premium: number;
  status: string;
  workflow_stage: string;
  created_at: string;
  valid_until: string;
}

interface QuoteManagementWorkflowProps {
  editingQuote?: Quote | null;
  onWorkflowComplete?: () => void;
  onBack?: () => void;
}

export const QuoteManagementWorkflow = ({ editingQuote, onWorkflowComplete, onBack }: QuoteManagementWorkflowProps) => {
  const { state, dispatch } = useWorkflowContext();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(state.currentStep as WorkflowStep || 'client-onboarding');
  const [showEditModeSelector, setShowEditModeSelector] = useState<boolean>(false);
  const [editClientMode, setEditClientMode] = useState<boolean>(false);

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

  // Map workflow stages to step IDs for resumption
  const stageToStepMap: Record<string, WorkflowStep> = {
    'draft': 'quote-drafting',
    'client-onboarding': 'client-onboarding',
    'quote-drafting': 'quote-drafting', 
    'clause-recommendation': 'clause-recommendation',
    'rfq-generation': 'rfq-generation',
    'insurer-matching': 'insurer-matching',
    'quote-evaluation': 'quote-evaluation',
    'client-selection': 'client-selection',
    'payment-processing': 'payment-processing',
    'contract-generation': 'contract-generation',
    'client_approved': 'payment-processing',
    'payment_processing': 'payment-processing',
    'payment_completed': 'contract-generation',
    'contract_generated': 'contract-generation'
  };

  // Initialize workflow based on editing mode
  useEffect(() => {
    if (editingQuote) {
      const hasCompletedClientOnboarding = editingQuote.workflow_stage !== 'client-onboarding' && 
                                         editingQuote.workflow_stage !== 'draft';
      
      if (hasCompletedClientOnboarding && !editClientMode) {
        setShowEditModeSelector(true);
        return;
      }

      // If editing client or new quote, start from appropriate step
      if (editClientMode) {
        setCurrentStep('client-onboarding');
        dispatch({ type: 'SET_STEP', payload: 'client-onboarding' });
      } else {
        // Resume from current workflow stage
        const resumeStep = stageToStepMap[editingQuote.workflow_stage] || 'quote-drafting';
        setCurrentStep(resumeStep);
        dispatch({ type: 'SET_STEP', payload: resumeStep });
        
        // Mark previous steps as completed if resuming from later stage
        const resumeIndex = steps.findIndex(step => step.id === resumeStep);
        for (let i = 0; i < resumeIndex; i++) {
          dispatch({ type: 'COMPLETE_STEP', payload: steps[i].id });
        }
      }
    } else {
      // For new quotes, ensure fresh start
      handleResetWorkflow();
    }
  }, [editingQuote, editClientMode]);

  const handleContinueQuoteEdit = () => {
    setShowEditModeSelector(false);
    setEditClientMode(false);
    // Resume from current stage
    const resumeStep = stageToStepMap[editingQuote?.workflow_stage || 'quote-drafting'] || 'quote-drafting';
    setCurrentStep(resumeStep);
    dispatch({ type: 'SET_STEP', payload: resumeStep });
    
    // Mark previous steps as completed
    const resumeIndex = steps.findIndex(step => step.id === resumeStep);
    for (let i = 0; i < resumeIndex; i++) {
      dispatch({ type: 'COMPLETE_STEP', payload: steps[i].id });
    }
  };

  const handleEditClientDetails = () => {
    setShowEditModeSelector(false);
    setEditClientMode(true);
    setCurrentStep('client-onboarding');
    dispatch({ type: 'SET_STEP', payload: 'client-onboarding' });
  };

  const handleStepComplete = (stepId: WorkflowStep, data: any) => {
    // Map step IDs to proper data keys
    const keyMap: Record<string, string> = {
      'client-onboarding': 'client',
      'quote-drafting': 'quote', 
      'clause-recommendation': 'clauses',
      'rfq-generation': 'rfq',
      'insurer-matching': 'insurerMatches',
      'quote-evaluation': 'quotes',
      'client-selection': 'clientSelection',
      'payment-processing': 'payment',
      'contract-generation': 'contracts'
    };
    
    const key = keyMap[stepId] || stepId.replace('-', '');
    dispatch({ type: 'SET_DATA', payload: { key, data } });
    dispatch({ type: 'COMPLETE_STEP', payload: stepId });
    dispatch({ type: 'SET_STEP', payload: stepId });
    
    // Auto-advance to next step
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1].id as WorkflowStep;
      setCurrentStep(nextStep);
      dispatch({ type: 'SET_STEP', payload: nextStep });
    } else if (onWorkflowComplete) {
      // Call completion callback when workflow is done
      onWorkflowComplete();
    }
  };

  const navigateToStep = (stepId: WorkflowStep) => {
    setCurrentStep(stepId);
    dispatch({ type: 'SET_STEP', payload: stepId });
  };

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);

  const canNavigateToStep = (stepId: WorkflowStep) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = getCurrentStepIndex();
    
    // Can navigate to current step, previous steps, or next immediate step
    return stepIndex <= currentIndex + 1 || state.completedSteps.has(stepId);
  };

  const handleResetWorkflow = () => {
    // Clear all workflow state including localStorage
    dispatch({ type: 'RESET_WORKFLOW' });
    setCurrentStep('client-onboarding');
    setShowEditModeSelector(false);
    setEditClientMode(false);
    
    // Also clear any browser storage that might contain quote IDs
    try {
      sessionStorage.removeItem('currentQuoteId');
      sessionStorage.removeItem('workflowQuoteId');
    } catch (error) {
      console.error('Failed to clear session storage:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'client-onboarding':
        return (
          <ClientOnboardingEnhanced
            onClientSelected={(client) => 
              handleStepComplete('client-onboarding', client)
            }
            onBack={() => {/* Handle cancel */}}
          />
        );
      
      case 'quote-drafting':
        return (
          <QuoteIntakeDraftingEnhanced
            clientData={state.workflowData.client}
            editingQuote={editingQuote}
            onQuoteSaved={(quoteData) => 
              handleStepComplete('quote-drafting', quoteData)
            }
            onBack={() => navigateToStep('client-onboarding')}
          />
        );
      
      case 'clause-recommendation':
        return (
          <ClauseRecommendationEnhanced
            quoteData={state.workflowData.quote}
            onClausesSelected={(clauses) => 
              handleStepComplete('clause-recommendation', clauses)
            }
            onBack={() => navigateToStep('quote-drafting')}
          />
        );
      
      case 'rfq-generation':
        return (
          <RFQGenerationEnhanced
            quoteData={state.workflowData.quote}
            clauses={state.workflowData.clauses}
            onRFQGenerated={(rfqData) => 
              handleStepComplete('rfq-generation', rfqData)
            }
            onBack={() => navigateToStep('clause-recommendation')}
          />
        );
      
      case 'insurer-matching':
        return (
          <InsurerMatchingEnhanced
            rfqData={state.workflowData.rfq}
            onMatchingComplete={(matches) => 
              handleStepComplete('insurer-matching', matches)
            }
            onBack={() => navigateToStep('rfq-generation')}
          />
        );
      
      case 'quote-evaluation':
        return (
          <QuoteEvaluationEnhanced
            insurerMatches={state.workflowData.insurerMatches}
            onEvaluationComplete={(evaluatedQuotes) => 
              handleStepComplete('quote-evaluation', evaluatedQuotes)
            }
            onBack={() => navigateToStep('insurer-matching')}
          />
        );
      
      case 'client-selection':
        return (
          <ClientSelection
            evaluatedQuotes={(state.workflowData as any).quoteevaluation || state.workflowData.quotes || []}
            clientData={state.workflowData.client}
            quoteData={state.workflowData.quote}
            onSelectionComplete={(selection) => 
              handleStepComplete('client-selection', selection)
            }
            onBack={() => navigateToStep('quote-evaluation')}
          />
        );
      
      case 'payment-processing':
        console.log('Payment processing - workflow data:', state.workflowData);
        return (
          <PaymentProcessing
            quoteId={state.workflowData.quote?.id || ''}
            clientData={state.workflowData.client}
            evaluatedQuotes={(state.workflowData as any).quoteevaluation || state.workflowData.quotes || []}
            selectedQuote={state.workflowData.clientSelection || (state.workflowData as any).clientselection}
            onPaymentComplete={(paymentData) => 
              handleStepComplete('payment-processing', paymentData)
            }
            onBack={() => navigateToStep('client-selection')}
          />
        );
      
      case 'contract-generation':
        return (
          <ContractGeneration
            paymentData={state.workflowData.payment}
            selectedQuote={state.workflowData.clientSelection}
            clientData={state.workflowData.client}
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

  // Show edit mode selector for existing quotes with completed client onboarding
  if (showEditModeSelector && editingQuote) {
    return (
      <QuoteEditModeSelector
        quote={editingQuote}
        onContinueQuoteEdit={handleContinueQuoteEdit}
        onEditClientDetails={handleEditClientDetails}
        onBack={onBack || (() => {})}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {editingQuote ? 
            (editClientMode ? `Edit Client Details - ${editingQuote.quote_number}` : `Edit Quote ${editingQuote.quote_number}`) : 
            'Quote Management Workflow'
          }
        </h1>
        <div className="flex gap-2">
          <Badge variant="outline">
            Step {getCurrentStepIndex() + 1} of {steps.length}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleResetWorkflow}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = state.completedSteps.has(step.id as WorkflowStep);
              const canNavigate = canNavigateToStep(step.id as WorkflowStep);
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <Button
                      variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
                      size="sm"
                      className={`w-12 h-12 rounded-full p-0 ${!canNavigate ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => canNavigate && navigateToStep(step.id as WorkflowStep)}
                      disabled={!canNavigate || state.loading}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                    <span className={`text-xs mt-2 text-center max-w-20 ${isActive ? 'font-semibold' : ''}`}>
                      {step.name}
                    </span>
                    {isCompleted && (
                      <Badge variant="secondary" className="mt-1 text-xs bg-green-100 text-green-700 border-green-300">
                        ✓
                      </Badge>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 mx-2 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <div className="min-h-[600px]">
        {state.loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-4"></div>
              <span>Processing...</span>
            </CardContent>
          </Card>
        ) : state.error ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-red-600 mb-4">Error: {state.error}</div>
              <Button onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {renderStepContent()}
            
          </div>
        )}
      </div>

      {/* Workflow Data Summary (for development) */}
      {process.env.NODE_ENV === 'development' && Object.keys(state.workflowData).length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Workflow Data Summary (Development)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-40">
              {JSON.stringify(state.workflowData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
