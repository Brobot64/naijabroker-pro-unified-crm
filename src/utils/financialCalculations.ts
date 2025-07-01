
export interface FinancialCalculation {
  grossPremium: number;
  netPremium: number;
  vat: number;
  commission: number;
  vatRate: number;
  commissionRate: number;
}

export const calculateFinancials = (
  grossPremium: number,
  commissionRate: number = 10,
  vatFlag: boolean = true,
  vatRate: number = 7.5
): FinancialCalculation => {
  const commission = (grossPremium * commissionRate) / 100;
  const vat = vatFlag ? (grossPremium * vatRate) / 100 : 0;
  const netPremium = grossPremium + vat;

  return {
    grossPremium,
    netPremium,
    vat,
    commission,
    vatRate,
    commissionRate
  };
};

export const validateSplits = (splits: Array<{ percentage: number }>, targetTotal: number = 100): boolean => {
  const total = splits.reduce((sum, split) => sum + split.percentage, 0);
  return Math.abs(total - targetTotal) < 0.01;
};

export const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
  return `${currency} ${amount.toLocaleString()}`;
};
