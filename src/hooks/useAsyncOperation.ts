
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface UseAsyncOperationResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useAsyncOperation<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options?: {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    errorMessage?: string;
  }
): UseAsyncOperationResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction(...args);
      setData(result);
      
      if (options?.showSuccessToast) {
        toast({
          title: "Success",
          description: options.successMessage || "Operation completed successfully",
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      if (options?.showErrorToast) {
        toast({
          title: "Error",
          description: options.errorMessage || errorMessage,
          variant: "destructive",
        });
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, options, toast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
