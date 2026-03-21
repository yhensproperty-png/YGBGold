import { supabase } from './supabaseClient.ts';
import { Order, OrderFormData, OrderStatus } from '../types.ts';
import { getOrderInvoiceHTML, getOrderConfirmedHTML, getOrderShippedHTML, getOrderCancelledHTML, getOrderReminderHTML, ConfirmedOrderData, ShippedOrderData, CancelledOrderData, ReminderOrderData } from '../utils/emailTemplates.ts';


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

    if (formData.combine_shipping) {
      const pairedNum = String(formData.paired_order_number || 0).padStart(4, '0');
      insertData.admin_notes = `[COMBINED SHIPPING] Paired with #${pairedNum} | email: ${formData.previous_order_ref || 'N/A'}`;
    }

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
      paired_order_number: formData.paired_order_number,
    });

    try {
      // 1. Send Invoice to Customer
      await fetch('/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.customer_email,
          subject: `Order #${orderNumber} Reserved — YGB Gold Invoice`,
          html: invoiceHtml,
        }),
      });

      // 2. Build Admin Alert HTML
      const adminAlertHtml = `
        <div style="font-family: sans-serif; padding: 20px; background: #fafafa;">
          <h2 style="color: #2F2F2F;">New Order Received! (#${orderNumber})</h2>
          <p><strong>Customer:</strong> ${formData.customer_name}</p>
          <p><strong>Email:</strong> ${formData.customer_email}</p>
          <p><strong>Phone:</strong> ${formData.customer_phone}</p>
          <p><strong>Ship To:</strong> ${formData.shipping_address}</p>
          <p><strong>Item:</strong> ${propertyTitle || 'Gold Item'}</p>
          <p><strong>Amount:</strong> ₱${(amount).toLocaleString()}</p>
          <p><strong>Shipping:</strong> ₱${formData.shipping_fee.toLocaleString()}</p>
          <p><strong>Combine Shipping:</strong> ${formData.combine_shipping ? `YES — Paired with Order #${String(formData.paired_order_number || 0).padStart(4, '0')} (Check Dashboard)` : 'No'}</p>
          <br/>
          <a href="https://ygbgold.com/manage?filter=pending" style="display:inline-block; padding: 12px 24px; background:#eab308; color:#000; font-weight:bold; text-decoration:none; border-radius:8px;">View Pending Orders</a>
        </div>
      `;

      // 3. Send Alert to Admin via Resend
      await fetch('/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'Contact@mail.ygbgold.com',
          subject: `🚨 NEW YGB ORDER: #${orderNumber} (${propertyTitle || 'Gold Item'})`,
          html: adminAlertHtml,
        }),
      });

      // 4. If combined, send a dedicated combined shipment summary to admin
      if (formData.combine_shipping && formData.paired_order_number) {
        const pairedNum = String(formData.paired_order_number).padStart(4, '0');
        const newNum = String(orderNumber).padStart(4, '0');
        const combinedSummaryHtml = `
          <div style="font-family:sans-serif;padding:24px;background:#fff5f5;border-radius:8px;">
            <h2 style="color:#c53030;margin:0 0 16px;">📦 Combined Shipment Alert</h2>
            <p style="margin:0 0 8px;">The following 2 orders must be <strong>shipped together in one package</strong>:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr style="background:#fed7d7;">
                <th style="padding:8px 12px;text-align:left;font-size:13px;">Order</th>
                <th style="padding:8px 12px;text-align:left;font-size:13px;">Details</th>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:8px 12px;font-weight:bold;">#${pairedNum} (existing)</td>
                <td style="padding:8px 12px;">Original order — already pending</td>
              </tr>
              <tr style="background:#fafafa;">
                <td style="padding:8px 12px;font-weight:bold;">#${newNum} (new)</td>
                <td style="padding:8px 12px;">${propertyTitle || 'Gold Item'} — ₱${amount.toLocaleString()} (free shipping)</td>
              </tr>
            </table>
            <p style="margin:0 0 8px;"><strong>Customer:</strong> ${formData.customer_name} (${formData.customer_email})</p>
            <p style="margin:0 0 16px;"><strong>Ship To:</strong> ${formData.shipping_address}</p>
            <a href="https://ygbgold.com/manage?filter=combined" style="display:inline-block;padding:12px 24px;background:#c53030;color:#fff;font-weight:bold;text-decoration:none;border-radius:8px;">View Combined Orders</a>
          </div>
        `;
        await fetch('/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'Contact@mail.ygbgold.com',
            subject: `📦 COMBINED SHIPMENT: Orders #${pairedNum} + #${newNum} — ${formData.customer_name}`,
            html: combinedSummaryHtml,
          }),
        });
      }

    } catch (emailError) {
      // Don't fail the order if email fails
      console.error('Email failed to send:', emailError);
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
   * Send the shipped email to the customer.
   */
  async sendShippedEmail(order: ShippedOrderData): Promise<void> {
    try {
      await fetch('/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: order.customer_email,
          subject: `Order #${order.order_number} Shipped — YGB Gold`,
          html: getOrderShippedHTML(order),
        }),
      });
    } catch (err) {
      console.error('Shipped email failed to send:', err);
    }
  },

  /**
   * Send the cancellation email to the customer and a notification to admin.
   */
  async sendCancelledEmail(order: CancelledOrderData): Promise<void> {
    try {
      await fetch('/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: order.customer_email,
          subject: `Order #${order.order_number} Cancelled — YGB Gold`,
          html: getOrderCancelledHTML(order),
        }),
      });
      await fetch('/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'Contact@mail.ygbgold.com',
          subject: `🚫 Order #${order.order_number} Cancelled — ${order.customer_name}`,
          html: `<div style="font-family:sans-serif;padding:20px;">
            <h2>Order Cancelled</h2>
            <p><strong>Order:</strong> #${order.order_number}</p>
            <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
            <p><strong>Item:</strong> ${order.property_title}</p>
            <p>The cancellation email has been sent to the customer.</p>
          </div>`,
        }),
      });
    } catch (err) {
      console.error('Cancelled email failed to send:', err);
    }
  },

  /**
   * Send a payment reminder email to the customer.
   */
  async sendReminderEmail(order: ReminderOrderData): Promise<void> {
    try {
      await fetch('/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: order.customer_email,
          subject: `Reminder: Your YGB Gold Order #${order.order_number} is waiting for payment`,
          html: getOrderReminderHTML(order),
        }),
      });
    } catch (err) {
      console.error('Reminder email failed to send:', err);
    }
  },

  /**
   * Update the status and optionally the tracking number of an order.
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string, adminNotes?: string, shippingCarrier?: string): Promise<void> {
    const updateData: any = { status };
    if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes;
    if (shippingCarrier !== undefined) updateData.shipping_carrier = shippingCarrier;

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
