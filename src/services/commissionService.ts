import { supabase } from './supabaseClient';
import { Commission, CommissionFormData } from '../types';

export const commissionService = {
  async getAllCommissions(): Promise<Commission[]> {
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching commissions:', error);
      throw error;
    }

    return data || [];
  },

  async getCommissionByPropertyId(propertyId: string): Promise<Commission | null> {
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('property_id', propertyId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching commission:', error);
      throw error;
    }

    return data;
  },

  async createCommission(
    propertyId: string,
    listingId: string,
    propertyTitle: string
  ): Promise<Commission> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('commissions')
      .insert({
        property_id: propertyId,
        listing_id: listingId,
        property_title: propertyTitle,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating commission:', error);
      throw error;
    }

    return data;
  },

  async updateCommission(
    commissionId: string,
    updates: Partial<CommissionFormData>
  ): Promise<Commission> {
    const updateData: any = {
      ...updates,
    };

    if (updates.customer_paid !== undefined) {
      updateData.customer_payment_date = updates.customer_paid ? new Date().toISOString() : null;
    }

    if (updates.yhen_paid !== undefined) {
      updateData.yhen_payment_date = updates.yhen_paid ? new Date().toISOString() : null;
    }

    if (updates.taylor_paid !== undefined) {
      updateData.taylor_payment_date = updates.taylor_paid ? new Date().toISOString() : null;
    }

    if (updates.daphne_paid !== undefined) {
      updateData.daphne_payment_date = updates.daphne_paid ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from('commissions')
      .update(updateData)
      .eq('id', commissionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating commission:', error);
      throw error;
    }

    return data;
  },

  async deleteCommission(commissionId: string): Promise<void> {
    const { error } = await supabase
      .from('commissions')
      .delete()
      .eq('id', commissionId);

    if (error) {
      console.error('Error deleting commission:', error);
      throw error;
    }
  },

  calculateCommissionAmounts(
    soldPrice: number,
    yhenPercentage: number,
    taylorPercentage: number
  ): { yhenAmount: number; taylorAmount: number; totalPercentage: number } {
    const yhenAmount = (soldPrice * yhenPercentage) / 100;
    const taylorAmount = (soldPrice * taylorPercentage) / 100;
    const totalPercentage = yhenPercentage + taylorPercentage;

    return {
      yhenAmount,
      taylorAmount,
      totalPercentage,
    };
  },
};
