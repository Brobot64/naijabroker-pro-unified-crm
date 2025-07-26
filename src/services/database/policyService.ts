
import { supabase } from '@/integrations/supabase/client';
import { Policy, PolicyInsert, PolicyUpdate } from './types';
import { BaseService, ServiceResponse } from './baseService';

export class PolicyService extends BaseService {
  static async getAll(): Promise<Policy[]> {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching policies:', error);
      throw new Error('Failed to fetch policies');
    }
    
    return data || [];
  }

  static async getById(id: string): Promise<Policy | null> {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching policy:', error);
      throw new Error('Failed to fetch policy');
    }
    
    return data;
  }

  static async create(policy: PolicyInsert): Promise<Policy> {
    const { data, error } = await supabase
      .from('policies')
      .insert(policy)
      .select()
      .single();

    if (error) {
      console.error('Error creating policy:', error);
      throw new Error('Failed to create policy');
    }
    
    return data;
  }

  static async update(id: string, updates: PolicyUpdate): Promise<Policy> {
    const { data, error } = await supabase
      .from('policies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating policy:', error);
      throw new Error('Failed to update policy');
    }
    
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting policy:', error);
      throw new Error('Failed to delete policy');
    }
  }

  static async getExpiringPolicies(daysAhead = 30): Promise<Policy[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .lte('end_date', futureDate.toISOString().split('T')[0])
      .eq('status', 'active')
      .order('end_date', { ascending: true });

    if (error) {
      console.error('Error fetching expiring policies:', error);
      throw new Error('Failed to fetch expiring policies');
    }
    
    return data || [];
  }

  static async deactivatePolicy(id: string, reason?: string): Promise<Policy> {
    const { data, error } = await supabase
      .from('policies')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        notes: reason ? `Deactivated: ${reason}` : 'Policy deactivated'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deactivating policy:', error);
      throw new Error('Failed to deactivate policy');
    }
    
    return data;
  }

  static async reactivatePolicy(id: string): Promise<Policy> {
    const { data, error } = await supabase
      .from('policies')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error reactivating policy:', error);
      throw new Error('Failed to reactivate policy');
    }
    
    return data;
  }

  static async getDashboardStats(): Promise<{
    totalPremiumYTD: number;
    monthlyPremium: number;
    activePolicies: number;
    pendingRenewals: number;
    totalSumInsured: number;
    productMix: Array<{ name: string; value: number; percentage: number }>;
    monthlyTrends: Array<{ month: string; premium: number; claims: number }>;
  }> {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentDate = new Date();
    const renewalDate = new Date();
    renewalDate.setDate(currentDate.getDate() + 60);

    // Get all active policies
    const { data: activePolicies, error: activePoliciesError } = await supabase
      .from('policies')
      .select('*')
      .eq('status', 'active');

    if (activePoliciesError) throw activePoliciesError;

    // Get policies for current month
    const { data: monthlyPolicies, error: monthlyError } = await supabase
      .from('policies')
      .select('premium, created_at')
      .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
      .lt('created_at', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

    if (monthlyError) throw monthlyError;

    // Get pending renewals
    const { data: pendingRenewals, error: renewalsError } = await supabase
      .from('policies')
      .select('*')
      .eq('status', 'active')
      .lte('end_date', renewalDate.toISOString().split('T')[0])
      .gte('end_date', currentDate.toISOString().split('T')[0]);

    if (renewalsError) throw renewalsError;

    // Calculate stats
    const totalPremiumYTD = activePolicies?.reduce((sum, p) => sum + Number(p.premium || 0), 0) || 0;
    const monthlyPremium = monthlyPolicies?.reduce((sum, p) => sum + Number(p.premium || 0), 0) || 0;
    const totalSumInsured = activePolicies?.reduce((sum, p) => sum + Number(p.sum_insured || 0), 0) || 0;

    // Product mix calculation
    const productTypes = activePolicies?.reduce((acc, policy) => {
      const type = policy.policy_type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalCount = activePolicies?.length || 0;
    const productMix = Object.entries(productTypes).map(([name, count]) => ({
      name,
      value: count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
    }));

    // Monthly trends (simplified - would need to aggregate by actual month)
    const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(currentYear, i).toLocaleDateString('en', { month: 'short' });
      return {
        month,
        premium: Math.floor(totalPremiumYTD / 12 * (0.8 + Math.random() * 0.4)), // Mock distribution
        claims: Math.floor(totalPremiumYTD / 12 * 0.3 * (0.8 + Math.random() * 0.4)) // Mock claims
      };
    });

    return {
      totalPremiumYTD,
      monthlyPremium,
      activePolicies: activePolicies?.length || 0,
      pendingRenewals: pendingRenewals?.length || 0,
      totalSumInsured,
      productMix,
      monthlyTrends
    };
  }
}
