
import { OnboardingData } from './types';

export const validateOrganizationData = (data: OnboardingData, userId: string): string | null => {
  if (!userId) return 'User ID is required';
  if (!data.organization.name?.trim()) return 'Organization name is required';
  if (!data.organization.plan?.trim()) return 'Organization plan is required';
  if (!data.adminUser.firstName?.trim()) return 'Admin first name is required';
  if (!data.adminUser.lastName?.trim()) return 'Admin last name is required';
  if (!data.adminUser.email?.trim()) return 'Admin email is required';
  
  const validRoles = ['SuperAdmin', 'BrokerAdmin', 'Agent', 'Underwriter', 'Compliance', 'User'];
  if (!validRoles.includes(data.adminUser.role)) {
    return `Invalid admin role: ${data.adminUser.role}. Must be one of: ${validRoles.join(', ')}`;
  }
  
  return null;
};

export const validateTeamData = (team: OnboardingData['team']): string | null => {
  if (!Array.isArray(team)) return 'Team data must be an array';
  
  const validRoles = ['SuperAdmin', 'BrokerAdmin', 'Agent', 'Underwriter', 'Compliance', 'User'];
  
  for (let i = 0; i < team.length; i++) {
    const member = team[i];
    if (!member.email?.trim()) return `Team member ${i + 1}: Email is required`;
    if (!member.role?.trim()) return `Team member ${i + 1}: Role is required`;
    if (!validRoles.includes(member.role)) {
      return `Team member ${i + 1}: Invalid role ${member.role}. Must be one of: ${validRoles.join(', ')}`;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(member.email)) {
      return `Team member ${i + 1}: Invalid email format`;
    }
  }
  
  return null;
};
