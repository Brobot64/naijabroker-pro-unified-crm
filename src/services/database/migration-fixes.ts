
// Database schema validation and migration helpers
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseValidationResult {
  isValid: boolean;
  missingColumns: string[];
  typeIssues: string[];
  orphanedRecords: string[];
}

export class DatabaseValidator {
  static async validateQuotesTable(): Promise<DatabaseValidationResult> {
    const result: DatabaseValidationResult = {
      isValid: true,
      missingColumns: [],
      typeIssues: [],
      orphanedRecords: []
    };

    try {
      // Check for quotes with missing client references
      const { data: orphanedQuotes, error } = await supabase
        .from('quotes')
        .select('id, quote_number, client_id')
        .is('client_id', null);

      if (error) throw error;

      if (orphanedQuotes && orphanedQuotes.length > 0) {
        result.isValid = false;
        result.orphanedRecords.push(
          `Found ${orphanedQuotes.length} quotes without client references`
        );
      }

      // Check for quotes with invalid workflow stages
      const { data: invalidStageQuotes, error: stageError } = await supabase
        .from('quotes')
        .select('id, quote_number, workflow_stage')
        .not('workflow_stage', 'in', '(draft,client-onboarding,quote-drafting,clause-recommendation,rfq-generation,insurer-matching,quote-evaluation,client-selection,payment-processing,contract-generation,completed)');

      if (stageError) throw stageError;

      if (invalidStageQuotes && invalidStageQuotes.length > 0) {
        result.isValid = false;
        result.typeIssues.push(
          `Found ${invalidStageQuotes.length} quotes with invalid workflow stages`
        );
      }

    } catch (error) {
      console.error('Database validation error:', error);
      result.isValid = false;
    }

    return result;
  }

  static async validateClientsTable(): Promise<DatabaseValidationResult> {
    const result: DatabaseValidationResult = {
      isValid: true,
      missingColumns: [],
      typeIssues: [],
      orphanedRecords: []
    };

    try {
      // Check for clients with missing required fields
      const { data: incompleteClients, error } = await supabase
        .from('clients')
        .select('id, name, client_code')
        .or('name.is.null,client_code.is.null');

      if (error) throw error;

      if (incompleteClients && incompleteClients.length > 0) {
        result.isValid = false;
        result.missingColumns.push(
          `Found ${incompleteClients.length} clients with missing required fields`
        );
      }

    } catch (error) {
      console.error('Client validation error:', error);
      result.isValid = false;
    }

    return result;
  }

  static async fixOrphanedQuotes(): Promise<void> {
    try {
      // Update quotes without client_id to use client_name for lookup
      const { data: orphanedQuotes, error: fetchError } = await supabase
        .from('quotes')
        .select('id, client_name')
        .is('client_id', null)
        .not('client_name', 'is', null);

      if (fetchError) throw fetchError;

      for (const quote of orphanedQuotes || []) {
        // Try to find matching client by name
        const { data: matchingClient, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .ilike('name', quote.client_name)
          .limit(1)
          .maybeSingle();

        if (clientError) continue;

        if (matchingClient) {
          // Update quote with found client_id
          await supabase
            .from('quotes')
            .update({ client_id: matchingClient.id })
            .eq('id', quote.id);
        }
      }
    } catch (error) {
      console.error('Error fixing orphaned quotes:', error);
    }
  }

  static async fixInvalidWorkflowStages(): Promise<void> {
    try {
      // Update quotes with invalid workflow stages to 'draft'
      await supabase
        .from('quotes')
        .update({ workflow_stage: 'draft' })
        .not('workflow_stage', 'in', '(draft,client-onboarding,quote-drafting,clause-recommendation,rfq-generation,insurer-matching,quote-evaluation,client-selection,payment-processing,contract-generation,completed)');

    } catch (error) {
      console.error('Error fixing workflow stages:', error);
    }
  }
}
