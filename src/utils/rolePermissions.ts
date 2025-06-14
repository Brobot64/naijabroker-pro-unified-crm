
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  level: number; // Higher number = more permissions
}

export interface Permission {
  module: string;
  actions: string[];
}

export const ROLES: Record<string, Role> = {
  SuperAdmin: {
    id: 'SuperAdmin',
    name: 'Super Admin',
    description: 'Full platform access including system configuration',
    level: 100,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'leads', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'quotes', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { module: 'policies', actions: ['create', 'read', 'update', 'delete', 'issue'] },
      { module: 'financial', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { module: 'claims', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { module: 'users', actions: ['create', 'read', 'update', 'delete', 'invite'] },
      { module: 'compliance', actions: ['create', 'read', 'update', 'delete', 'audit'] },
      { module: 'system', actions: ['configure', 'backup', 'restore'] }
    ]
  },
  OrganizationAdmin: {
    id: 'OrganizationAdmin',
    name: 'Organization Admin',
    description: 'Complete organization management capabilities',
    level: 90,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'leads', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'quotes', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { module: 'policies', actions: ['create', 'read', 'update', 'delete', 'issue'] },
      { module: 'financial', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { module: 'claims', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { module: 'users', actions: ['create', 'read', 'update', 'delete', 'invite'] },
      { module: 'compliance', actions: ['read', 'update', 'delete', 'audit'] },
      { module: 'branding', actions: ['configure'] }
    ]
  },
  BrokerAdmin: {
    id: 'BrokerAdmin',
    name: 'Broker Admin',
    description: 'Broker operations and team management',
    level: 80,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'leads', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'quotes', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'policies', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'financial', actions: ['read', 'update'] },
      { module: 'claims', actions: ['create', 'read', 'update'] },
      { module: 'users', actions: ['read', 'update', 'invite'] },
      { module: 'compliance', actions: ['read'] }
    ]
  },
  Underwriter: {
    id: 'Underwriter',
    name: 'Underwriter',
    description: 'Risk evaluation and policy issuance',
    level: 70,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'quotes', actions: ['read', 'update', 'approve'] },
      { module: 'policies', actions: ['create', 'read', 'update', 'issue'] },
      { module: 'financial', actions: ['read'] },
      { module: 'claims', actions: ['read', 'update', 'approve'] },
      { module: 'compliance', actions: ['read'] }
    ]
  },
  Agent: {
    id: 'Agent',
    name: 'Agent',
    description: 'Lead generation and client management',
    level: 60,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'leads', actions: ['create', 'read',

 'update'] },
      { module: 'quotes', actions: ['create', 'read', 'update'] },
      { module: 'policies', actions: ['read'] },
      { module: 'claims', actions: ['create', 'read'] }
    ]
  },
  Compliance: {
    id: 'Compliance',
    name: 'Compliance Officer',
    description: 'Regulatory compliance and audit',
    level: 75,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'policies', actions: ['read'] },
      { module: 'financial', actions: ['read', 'audit'] },
      { module: 'claims', actions: ['read', 'audit'] },
      { module: 'compliance', actions: ['create', 'read', 'update', 'delete', 'audit'] }
    ]
  },
  User: {
    id: 'User',
    name: 'User',
    description: 'Basic analytics and reporting access',
    level: 50,
    permissions: [
      { module: 'dashboard', actions: ['read'] }
    ]
  }
};

export const hasPermission = (userRole: string, module: string, action: string): boolean => {
  const role = ROLES[userRole];
  if (!role) return false;

  const modulePermission = role.permissions.find(p => p.module === module);
  if (!modulePermission) return false;

  return modulePermission.actions.includes(action);
};

export const canAccessModule = (userRole: string, module: string): boolean => {
  const role = ROLES[userRole];
  if (!role) return false;

  return role.permissions.some(p => p.module === module);
};

export const getRoleLevel = (userRole: string): number => {
  const role = ROLES[userRole];
  return role ? role.level : 0;
};

export const canManageUser = (managerRole: string, targetRole: string): boolean => {
  const managerLevel = getRoleLevel(managerRole);
  const targetLevel = getRoleLevel(targetRole);
  
  return managerLevel > targetLevel;
};

export const getAccessibleRoles = (userRole: string): Role[] => {
  const userLevel = getRoleLevel(userRole);
  
  return Object.values(ROLES).filter(role => role.level < userLevel);
};
