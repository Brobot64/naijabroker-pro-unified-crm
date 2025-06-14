
import { useState, useEffect } from 'react';
import { adminService, AdminUser, SecuritySettings, AuditLogEntry } from '../services/adminService';

export const useAdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = () => {
      setLoading(true);
      const users = adminService.getAdminUsers();
      setAdminUsers(users);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const createUser = async (userData: Omit<AdminUser, 'id' | 'lastLogin' | 'status'>) => {
    const newUser = adminService.createAdminUser(userData);
    setAdminUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = async (userId: string, updates: Partial<AdminUser>) => {
    const updatedUser = adminService.updateAdminUser(userId, updates);
    if (updatedUser) {
      setAdminUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    }
    return updatedUser;
  };

  return { adminUsers, loading, createUser, updateUser };
};

export const useSecuritySettings = () => {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchSettings = () => {
      setLoading(true);
      const currentSettings = adminService.getSecuritySettings();
      setSettings(currentSettings);
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const updateSettings = (newSettings: SecuritySettings) => {
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    if (settings) {
      adminService.updateSecuritySettings(settings);
      setHasUnsavedChanges(false);
    }
  };

  return { settings, loading, hasUnsavedChanges, updateSettings, saveSettings };
};

export const useAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = () => {
      setLoading(true);
      const logs = adminService.getAuditLogs();
      setAuditLogs(logs);
      setLoading(false);
    };

    fetchLogs();
  }, []);

  return { auditLogs, loading, refetch: () => setAuditLogs(adminService.getAuditLogs()) };
};
