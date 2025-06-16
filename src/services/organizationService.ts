
// Re-export everything from the modular organization service files
export { OnboardingData, CreateOrganizationResult, GetUserOrganizationResult } from './organization/types';
export { validateOrganizationData, validateTeamData } from './organization/validation';
export { testDatabaseSetup, getUserOrganization } from './organization/database';
export { createOrganizationFromOnboarding } from './organization/creation';

// Main organization service object for backward compatibility
export const organizationService = {
  testDatabaseSetup: async () => {
    const { testDatabaseSetup } = await import('./organization/database');
    return testDatabaseSetup();
  },
  
  createOrganizationFromOnboarding: async (data: any, userId: string) => {
    const { createOrganizationFromOnboarding } = await import('./organization/creation');
    return createOrganizationFromOnboarding(data, userId);
  },
  
  getUserOrganization: async (userId: string) => {
    const { getUserOrganization } = await import('./organization/database');
    return getUserOrganization(userId);
  }
};
