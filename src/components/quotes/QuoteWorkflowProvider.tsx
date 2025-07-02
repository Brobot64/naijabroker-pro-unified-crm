
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowState {
  currentStep: string;
  workflowData: {
    client?: any;
    quote?: any;
    clauses?: any[];
    rfq?: any;
    insurerMatches?: any[];
    quotes?: any[];
    clientSelection?: any;
    payment?: any;
    contracts?: any;
  };
  completedSteps: Set<string>;
  loading: boolean;
  error: string | null;
}

type WorkflowAction = 
  | { type: 'SET_STEP'; payload: string }
  | { type: 'SET_DATA'; payload: { key: string; data: any } }
  | { type: 'COMPLETE_STEP'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_SAVED_STATE'; payload: WorkflowState }
  | { type: 'RESET_WORKFLOW' };

const initialState: WorkflowState = {
  currentStep: 'client-onboarding',
  workflowData: {},
  completedSteps: new Set(),
  loading: false,
  error: null,
};

const workflowReducer = (state: WorkflowState, action: WorkflowAction): WorkflowState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_DATA':
      return {
        ...state,
        workflowData: {
          ...state.workflowData,
          [action.payload.key]: action.payload.data,
        },
      };
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.payload]),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOAD_SAVED_STATE':
      return {
        ...action.payload,
        completedSteps: new Set(Array.from(action.payload.completedSteps)),
      };
    case 'RESET_WORKFLOW':
      return initialState;
    default:
      return state;
  }
};

const WorkflowContext = createContext<{
  state: WorkflowState;
  dispatch: React.Dispatch<WorkflowAction>;
  saveState: () => void;
  loadState: () => void;
} | null>(null);

export const WorkflowProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);
  const { toast } = useToast();

  const saveState = () => {
    try {
      const stateToSave = {
        ...state,
        completedSteps: Array.from(state.completedSteps),
      };
      localStorage.setItem('quoteWorkflowState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save workflow state:', error);
    }
  };

  const loadState = () => {
    try {
      const savedState = localStorage.getItem('quoteWorkflowState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_SAVED_STATE', payload: parsedState });
      }
    } catch (error) {
      console.error('Failed to load workflow state:', error);
      toast({
        title: "Warning",
        description: "Could not restore previous workflow state",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    if (state.currentStep !== 'client-onboarding' || Object.keys(state.workflowData).length > 0) {
      saveState();
    }
  }, [state]);

  return (
    <WorkflowContext.Provider value={{ state, dispatch, saveState, loadState }}>
      {children}
    </WorkflowContext.Provider>
  );
};

// Export both names for compatibility
export const QuoteWorkflowProvider = WorkflowProvider;

export const useWorkflowContext = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflowContext must be used within a WorkflowProvider');
  }
  return context;
};
