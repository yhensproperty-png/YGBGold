import { supabase } from './supabaseClient.ts';
import { Order, OrderFormData, OrderStatus } from '../types.ts';

export const OrderService = {
  /**
   * Fetch all orders, joining with the properties table to get listing details.
   * Typically used by Admins.
   */
  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        properties!orders_listing_id_fkey (
          title,
          slug,
          city,
          images
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    // Map the joined data to our Order interface
    return (data || []).map((row: any) => ({
      ...row,
      property_title: row.properties?.title,
      property_slug: row.properties?.slug,
      property_city: row.properties?.city,
      property_image: Array.isArray(row.properties?.images) && row.properties.images.length > 0 
        ? row.properties.images[0] 
        : undefined
    }));
  },

  /**
   * Fetch orders belonging to a specific user.
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        properties!orders_listing_id_fkey (
          title,
          slug,
          city,
          images
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      ...row,
      property_title: row.properties?.title,
      property_slug: row.properties?.slug,
      property_city: row.properties?.city,
      property_image: Array.isArray(row.properties?.images) && row.properties.images.length > 0 
        ? row.properties.images[0] 
        : undefined
    }));
  },

  /**
   * Attempt to insert a new order into the database.
   */
  async addOrder(listingId: string, amount: number, formData: OrderFormData, userId?: string): Promise<void> {
    const insertData: any = {
      listing_id: listingId,
      amount: amount,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      shipping_address: formData.shipping_address,
      status: OrderStatus.Pending
    };

    if (userId) {
      insertData.user_id = userId;
    }

    const { error } = await supabase
      .from('orders')
      .insert(insertData);

    if (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  },

  /**
   * Update the status and optionally the tracking number of an order.
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string, adminNotes?: string): Promise<void> {
    const updateData: any = { status };
    if (trackingNumber !== undefined) {
      updateData.tracking_number = trackingNumber;
    }
    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  }
};
