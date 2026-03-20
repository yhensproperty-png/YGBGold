import { supabase } from './supabaseClient.ts';
import { Order, OrderFormData, OrderStatus } from '../types.ts';
import { getOrderInvoiceHTML, getOrderConfirmedHTML, ConfirmedOrderData } from '../utils/emailTemplates.ts';


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
   * Attempt to insert a new order into the database, then send an invoice email.
   * Returns the human-readable order_number.
   */
  async addOrder(listingId: string, amount: number, formData: OrderFormData, userId?: string, propertyTitle?: string): Promise<number> {
    const insertData: any = {
      listing_id: listingId,
      amount: amount,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      shipping_address: formData.shipping_address,
      shipping_country_group: formData.shipping_country_group,
      shipping_fee: formData.shipping_fee,
      status: OrderStatus.Pending
    };

    if (userId) {
      insertData.user_id = userId;
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(insertData)
      .select('order_number')
      .single();

    if (error) {
      console.error('Error adding order:', error);
      throw error;
    }

    const orderNumber: number = data.order_number;

    // Send invoice email to customer
    const invoiceHtml = getOrderInvoiceHTML({
      order_number: orderNumber,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      shipping_address: formData.shipping_address,
      shipping_country_group: formData.shipping_country_group,
      amount: amount,
      shipping_fee: formData.shipping_fee,
      property_title: propertyTitle || 'Gold Item',
    });

    try {
      await fetch('/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.customer_email,
          subject: `Order #${orderNumber} Reserved — YGB Gold Invoice`,
          html: invoiceHtml,
        }),
      });
    } catch (emailError) {
      // Don't fail the order if email fails
      console.error('Invoice email failed to send:', emailError);
    }

    return orderNumber;
  },

  /**
   * Send the payment confirmed email to the customer.
   */
  async sendConfirmedEmail(order: ConfirmedOrderData): Promise<void> {
    try {
      await fetch('/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: order.customer_email,
          subject: `Order #${order.order_number} Confirmed — YGB Gold`,
          html: getOrderConfirmedHTML(order),
        }),
      });
    } catch (err) {
      console.error('Confirmed email failed to send:', err);
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
