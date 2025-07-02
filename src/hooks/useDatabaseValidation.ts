
import { useState, useEffect } from 'react';
import { DatabaseValidator, DatabaseValidationResult } from '@/services/database/migration-fixes';
import { useToast } from '@/hooks/use-toast';

export const useDatabaseValidation = () => {
  const [validationResults, setValidationResults] = useState<{
    quotes: DatabaseValidationResult | null;
    clients: DatabaseValidationResult | null;
  }>({
    quotes: null,
    clients: null
  });
  
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidated, setLastValidated] = useState<Date | null>(null);
  const { toast } = useToast();

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const [quotesResult, clientsResult] = await Promise.all([
        DatabaseValidator.validateQuotesTable(),
        DatabaseValidator.validateClientsTable()
      ]);

      setValidationResults({
        quotes: quotesResult,
        clients: clientsResult
      });

      setLastValidated(new Date());

      // Show toast if issues found
      const totalIssues = 
        (quotesResult.missingColumns.length + quotesResult.typeIssues.length + quotesResult.orphanedRecords.length) +
        (clientsResult.missingColumns.length + clientsResult.typeIssues.length + clientsResult.orphanedRecords.length);

      if (totalIssues > 0) {
        toast({
          title: "Database Issues Found",
          description: `Found ${totalIssues} database integrity issues that need attention`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Database Validation Complete",
          description: "No issues found in database validation",
        });
      }

    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate database integrity",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const fixIssues = async () => {
    setIsValidating(true);
    try {
      await Promise.all([
        DatabaseValidator.fixOrphanedQuotes(),
        DatabaseValidator.fixInvalidWorkflowStages()
      ]);

      toast({
        title: "Database Issues Fixed",
        description: "Successfully fixed database integrity issues",
      });

      // Re-run validation
      await runValidation();

    } catch (error) {
      console.error('Fix error:', error);
      toast({
        title: "Fix Error",
        description: "Failed to fix some database issues",
        variant: "destructive"
      });
    }
  };

  const getTotalIssues = (): number => {
    if (!validationResults.quotes || !validationResults.clients) return 0;
    
    return (
      validationResults.quotes.missingColumns.length +
      validationResults.quotes.typeIssues.length +
      validationResults.quotes.orphanedRecords.length +
      validationResults.clients.missingColumns.length +
      validationResults.clients.typeIssues.length +
      validationResults.clients.orphanedRecords.length
    );
  };

  const hasIssues = (): boolean => {
    return getTotalIssues() > 0;
  };

  const getAllIssues = (): string[] => {
    if (!validationResults.quotes || !validationResults.clients) return [];
    
    return [
      ...validationResults.quotes.missingColumns,
      ...validationResults.quotes.typeIssues,
      ...validationResults.quotes.orphanedRecords,
      ...validationResults.clients.missingColumns,
      ...validationResults.clients.typeIssues,
      ...validationResults.clients.orphanedRecords
    ];
  };

  return {
    validationResults,
    isValidating,
    lastValidated,
    runValidation,
    fixIssues,
    getTotalIssues,
    hasIssues,
    getAllIssues
  };
};
