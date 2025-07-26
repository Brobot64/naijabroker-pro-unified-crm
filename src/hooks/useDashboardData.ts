import { useState, useEffect } from 'react';
import { PolicyService } from '@/services/database/policyService';
import { ClaimService } from '@/services/database/claimService';

interface DashboardData {
  totalPremiumYTD: number;
  monthlyPremium: number;
  activePolicies: number;
  pendingRenewals: number;
  pendingClaims: number;
  claimsRatio: number;
  productMix: Array<{ name: string; value: number; percentage: number; color: string }>;
  monthlyTrends: Array<{ month: string; premium: number; claims: number }>;
  loading: boolean;
  error: string | null;
}

const COLORS = [
  '#1e40af', '#059669', '#d97706', '#7c3aed', 
  '#0891b2', '#dc2626', '#9333ea', '#65a30d'
];

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    totalPremiumYTD: 0,
    monthlyPremium: 0,
    activePolicies: 0,
    pendingRenewals: 0,
    pendingClaims: 0,
    claimsRatio: 0,
    productMix: [],
    monthlyTrends: [],
    loading: true,
    error: null
  });

  const refreshData = async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Get policy dashboard stats
      const policyStats = await PolicyService.getDashboardStats();
      
      // Get pending claims count
      const claims = await ClaimService.getAll();
      const pendingClaims = claims.filter(claim => 
        !['settled', 'closed', 'rejected'].includes(claim.status)
      ).length;

      // Calculate claims ratio (settled claims amount vs total premium YTD)
      const settledClaims = claims.filter(claim => claim.status === 'settled');
      const totalSettledAmount = settledClaims.reduce((sum, claim) => 
        sum + Number(claim.settlement_amount || 0), 0
      );
      const claimsRatio = policyStats.totalPremiumYTD > 0 
        ? (totalSettledAmount / policyStats.totalPremiumYTD) * 100 
        : 0;

      // Add colors to product mix
      const productMixWithColors = policyStats.productMix.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length]
      }));

      setData({
        ...policyStats,
        pendingClaims,
        claimsRatio,
        productMix: productMixWithColors,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return { ...data, refreshData };
};