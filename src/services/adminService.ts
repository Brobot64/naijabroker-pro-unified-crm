
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
}

export interface SecuritySettings {
  ssoEnabled: boolean;
  mfaRequired: boolean;
  passwordExpiry: number;
  ipRestriction: boolean;
  sessionTimeout: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Mock data service - in real app, this would connect to your backend
class AdminService {
  private static instance: AdminService;
  private adminUsers: AdminUser[] = [
    {
      id: "admin-001",
      name: "System Administrator",
      email: "admin@company.com",
      role: "SuperAdmin",
      lastLogin: "2024-06-14 10:30",
      status: "active",
      permissions: ["all"]
    }
  ];

  private securitySettings: SecuritySettings = {
    ssoEnabled: true,
    mfaRequired: true,
    passwordExpiry: 90,
    ipRestriction: false,
    sessionTimeout: 480
  };

  private auditLogs: AuditLogEntry[] = [];

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // Admin Users Management
  getAdminUsers(): AdminUser[] {
    return this.adminUsers;
  }

  createAdminUser(userData: Omit<AdminUser, 'id' | 'lastLogin' | 'status'>): AdminUser {
    const newUser: AdminUser = {
      ...userData,
      id: `admin-${Date.now()}`,
      lastLogin: "Never",
      status: "pending"
    };
    this.adminUsers.push(newUser);
    this.logAction("ADMIN_USER_CREATED", "User Management", `Created admin user: ${newUser.email}`);
    return newUser;
  }

  updateAdminUser(userId: string, updates: Partial<AdminUser>): AdminUser | null {
    const userIndex = this.adminUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;
    
    this.adminUsers[userIndex] = { ...this.adminUsers[userIndex], ...updates };
    this.logAction("ADMIN_USER_UPDATED", "User Management", `Updated admin user: ${this.adminUsers[userIndex].email}`);
    return this.adminUsers[userIndex];
  }

  // Security Settings
  getSecuritySettings(): SecuritySettings {
    return this.securitySettings;
  }

  updateSecuritySettings(settings: SecuritySettings): void {
    this.securitySettings = settings;
    this.logAction("SECURITY_SETTINGS_UPDATED", "System Configuration", "Updated security settings", "high");
  }

  // Audit Logging
  getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  logAction(action: string, resource: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    const logEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: "current-user", // In real app, get from auth context
      userName: "Current User",
      action,
      resource,
      details,
      ipAddress: "192.168.1.100", // In real app, get actual IP
      severity
    };
    this.auditLogs.push(logEntry);
  }
}

export const adminService = AdminService.getInstance();
