
import { workflowCreation } from "./creation";
import { workflowQueries } from "./queries";
import { workflowOperations } from "./operations";

// Export all types
export * from "./types";

// Combine all workflow services into a single service object
export const workflowService = {
  ...workflowCreation,
  ...workflowQueries,
  ...workflowOperations,
};
