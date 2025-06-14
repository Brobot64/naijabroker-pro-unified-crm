
export interface FinancialSplit {
  insurerId: string;
  insurerName: string;
  percentage: number;
  premium: number;
}

export interface CommissionSplit {
  brokerId: string;
  brokerName: string;
  percentage: number;
  amount: number;
}

export interface FinancialCalculation {
  grossPremium: number;
  vat: number;
  netPremium: number;
  commission: number;
  adminCharges: number;
  insurerSplits: FinancialSplit[];
  commissionSplits: CommissionSplit[];
}

export class FinancialCalculator {
  private vatRate = 0.15; // 15% VAT
  private defaultCommissionRate = 0.10; // 10% commission

  calculateFinancials(
    grossPremium: number,
    commissionRate: number = this.defaultCommissionRate,
    adminChargeRate: number = 0.02,
    insurerSplits: { insurerId: string; insurerName: string; percentage: number }[] = []
  ): FinancialCalculation {
    const vat = grossPremium * this.vatRate;
    const netPremium = grossPremium + vat;
    const commission = grossPremium * commissionRate;
    const adminCharges = grossPremium * adminChargeRate;

    // Calculate insurer splits
    const calculatedInsurerSplits: FinancialSplit[] = insurerSplits.map(split => ({
      ...split,
      premium: grossPremium * (split.percentage / 100)
    }));

    return {
      grossPremium,
      vat,
      netPremium,
      commission,
      adminCharges,
      insurerSplits: calculatedInsurerSplits,
      commissionSplits: []
    };
  }

  validateSplits(splits: { percentage: number }[]): boolean {
    const total = splits.reduce((sum, split) => sum + split.percentage, 0);
    return Math.abs(total - 100) < 0.01; // Allow for small rounding errors
  }

  calculateRemittance(grossPremium: number, commission: number, adminCharges: number): number {
    return grossPremium - commission - adminCharges;
  }
}

export const financialCalculator = new FinancialCalculator();
