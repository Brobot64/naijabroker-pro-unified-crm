
export interface FinancialSplit {
  insurerId: string;
  insurerName: string;
  percentage: number;
  premium: number;
  isLead?: boolean;
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
  totalRemittance: number;
}

export class FinancialCalculator {
  private vatRate = 0.075; // 7.5% VAT for Nigeria
  private defaultCommissionRate = 0.10; // 10% commission

  calculateFinancials(
    grossPremium: number,
    commissionRate: number = this.defaultCommissionRate,
    adminChargeRate: number = 0.02,
    insurerSplits: { insurerId: string; insurerName: string; percentage: number; isLead?: boolean }[] = []
  ): FinancialCalculation {
    const vat = grossPremium * this.vatRate;
    const netPremium = grossPremium + vat;
    const commission = grossPremium * commissionRate;
    const adminCharges = grossPremium * adminChargeRate;
    const totalRemittance = this.calculateRemittance(grossPremium, commission, adminCharges);

    // Calculate insurer splits with real-time validation
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
      commissionSplits: [],
      totalRemittance
    };
  }

  validateSplits(splits: { percentage: number }[]): { isValid: boolean; total: number; error?: string } {
    const total = splits.reduce((sum, split) => sum + split.percentage, 0);
    const isValid = Math.abs(total - 100) < 0.01;
    
    return {
      isValid,
      total,
      error: !isValid ? `Split percentages total ${total.toFixed(2)}%. Must equal 100%.` : undefined
    };
  }

  calculateRemittance(grossPremium: number, commission: number, adminCharges: number): number {
    return grossPremium - commission - adminCharges;
  }

  // Real-time premium calculation with instant updates
  calculateInstantPremium(
    sumInsured: number,
    rate: number,
    discountPercentage: number = 0
  ): number {
    const basePremium = sumInsured * (rate / 100);
    const discount = basePremium * (discountPercentage / 100);
    return basePremium - discount;
  }

  // Co-insurer split validation with lead underwriter
  validateCoInsurerSplits(splits: FinancialSplit[]): {
    isValid: boolean;
    hasLead: boolean;
    totalPercentage: number;
    errors: string[];
  } {
    const errors: string[] = [];
    const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
    const leadUnderwriters = splits.filter(split => split.isLead);
    
    if (leadUnderwriters.length === 0) {
      errors.push('Must designate one lead underwriter');
    } else if (leadUnderwriters.length > 1) {
      errors.push('Only one lead underwriter allowed');
    }
    
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push(`Total percentage is ${totalPercentage.toFixed(2)}%, must equal 100%`);
    }
    
    return {
      isValid: errors.length === 0,
      hasLead: leadUnderwriters.length === 1,
      totalPercentage,
      errors
    };
  }
}

export const financialCalculator = new FinancialCalculator();
