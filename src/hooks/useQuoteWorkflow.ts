
import { useState, useEffect } from 'react';
import { QuoteService } from '@/services/database/quoteService';
import { useToast } from '@/hooks/use-toast';

export const useQuoteWorkflow = (quoteId?: string) => {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadQuote = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await QuoteService.getById(id);
      setQuote(data);
    } catch (err) {
      const errorMessage = 'Failed to load quote';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWorkflowStage = async (id: string, stage: string) => {
    try {
      const updatedQuote = await QuoteService.updateWorkflowStage(id, stage);
      setQuote(updatedQuote);
      toast({
        title: "Success",
        description: `Workflow stage updated to ${stage}`
      });
      return updatedQuote;
    } catch (err) {
      const errorMessage = 'Failed to update workflow stage';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateQuoteStatus = async (id: string, status: string) => {
    try {
      const updatedQuote = await QuoteService.updateStatus(id, status);
      setQuote(updatedQuote);
      toast({
        title: "Success",
        description: `Quote status updated to ${status}`
      });
      return updatedQuote;
    } catch (err) {
      const errorMessage = 'Failed to update quote status';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const convertToPolicy = async (id: string, policyId: string) => {
    try {
      const updatedQuote = await QuoteService.convertToPolicy(id, policyId);
      setQuote(updatedQuote);
      toast({
        title: "Success",
        description: "Quote successfully converted to policy"
      });
      return updatedQuote;
    } catch (err) {
      const errorMessage = 'Failed to convert quote to policy';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    if (quoteId) {
      loadQuote(quoteId);
    }
  }, [quoteId]);

  return {
    quote,
    loading,
    error,
    loadQuote,
    updateWorkflowStage,
    updateQuoteStatus,
    convertToPolicy,
    refetch: () => quoteId && loadQuote(quoteId)
  };
};
