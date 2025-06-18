
import { supabase } from '@/integrations/supabase/client';
import { SettlementVoucher, SettlementVoucherInsert, DischargeVoucher, DischargeVoucherInsert } from './types';

export class SettlementService {
  static async createSettlementVoucher(voucher: SettlementVoucherInsert): Promise<SettlementVoucher> {
    const { data, error } = await supabase
      .from('settlement_vouchers')
      .insert(voucher)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createDischargeVoucher(voucher: DischargeVoucherInsert): Promise<DischargeVoucher> {
    const { data, error } = await supabase
      .from('discharge_vouchers')
      .insert(voucher)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSettlementVouchers(): Promise<SettlementVoucher[]> {
    const { data, error } = await supabase
      .from('settlement_vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getDischargeVouchers(): Promise<DischargeVoucher[]> {
    const { data, error } = await supabase
      .from('discharge_vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async markSettlementProcessed(id: string): Promise<SettlementVoucher> {
    const { data, error } = await supabase
      .from('settlement_vouchers')
      .update({ is_processed: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
