
import { useState, useCallback, useMemo } from 'react';
import { calculateFinancials, validateSplits } from '@/utils/financialCalculations';

export const useFinancialCalculations = () => {
  const [grossPremium, setGrossPremium] = useState<number>(0);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [vatFlag, setVatFlag] = useState<boolean>(true);
  const [vatRate] = useState<number>(7.5);

  const calculations = useMemo(() => {
    return calculateFinancials(grossPremium, commissionRate, vatFlag, vatRate);
  }, [grossPremium, commissionRate, vatFlag, vatRate]);

  const validateInsurerSplits = useCallback((splits: Array<{ percentage: number }>) => {
    return validateSplits(splits, 100);
  }, []);

  const validateCommissionSplits = useCallback((splits: Array<{ percentage: number }>) => {
    return validateSplits(splits, 100);
  }, []);

  return {
    grossPremium,
    setGrossPremium,
    commissionRate,
    setCommissionRate,
    vatFlag,
    setVatFlag,
    calculations,
    validateSplits: validateInsurerSplits,
    validateCommissionSplits
  };
};
