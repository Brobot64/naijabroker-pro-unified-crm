
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse, PaginatedResponse } from '@/types';

// Generic hook for data fetching
export function useDataFetching<T>(
  fetchFunction: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFunction();
      
      if (response.error) {
        setError(response.error);
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        setData(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for paginated data
export function usePaginatedData<T>(
  fetchFunction: (page: number, limit: number, filters?: any) => Promise<ApiResponse<PaginatedResponse<T>>>,
  initialPage = 1,
  initialLimit = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<any>({});
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFunction(page, limit, filters);
      
      if (response.error) {
        setError(response.error);
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else if (response.data) {
        setData(response.data.data);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, fetchFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  const changeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filtering
  };

  return {
    data,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    filters,
    goToPage,
    changeLimit,
    updateFilters,
    refetch: fetchData
  };
}

// Hook for CRUD operations
export function useCrudOperations<T>(
  createFunction: (data: Partial<T>) => Promise<ApiResponse<T>>,
  updateFunction: (id: string, data: Partial<T>) => Promise<ApiResponse<T>>,
  deleteFunction: (id: string) => Promise<ApiResponse<void>>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const create = async (data: Partial<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await createFunction(data);
      
      if (response.error) {
        setError(response.error);
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return null;
      } else {
        toast({
          title: "Success",
          description: "Item created successfully",
        });
        return response.data;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: Partial<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateFunction(id, data);
      
      if (response.error) {
        setError(response.error);
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return null;
      } else {
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
        return response.data;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await deleteFunction(id);
      
      if (response.error) {
        setError(response.error);
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Success",
          description: "Item deleted successfully",
        });
        return true;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    update,
    remove,
    loading,
    error
  };
}
