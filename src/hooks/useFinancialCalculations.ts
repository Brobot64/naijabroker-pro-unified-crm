
import { useState, useCallback } from 'react';
import { financialCalculator } from '@/utils/financialCalculations';

export const useFinancialCalculations = () => {
  const [grossPremium, setGrossPremium] = useState<number>(0);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [adminChargeRate, setAdminChargeRate] = useState<number>(2);

  const calculations = useCallback(() => {
    const vat = grossPremium * 0.075; // 7.5% VAT
    const net = grossPremium + vat;
    const commission = grossPremium * (commissionRate / 100);
    const adminCharges = grossPremium * (adminChargeRate / 100);
    const remittance = grossPremium - commission - adminCharges;

    return {
      grossPremium,
      vat,
      netPremium: net,
      commission,
      adminCharges,
      totalRemittance: remittance
    };
  }, [grossPremium, commissionRate, adminChargeRate]);

  const validateSplits = useCallback((splits: { percentage: number }[]) => {
    return financialCalculator.validateSplits(splits);
  }, []);

  return {
    grossPremium,
    setGrossPremium,
    commissionRate,
    setCommissionRate,
    adminChargeRate,
    setAdminChargeRate,
    calculations: calculations(),
    validateSplits
  };
};
