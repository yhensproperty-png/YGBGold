export const PAYMENT_METHODS = {
  gcash: {
    name: 'DAYLYN ORIA',
    number: '09467543767',
    qrUrl: 'https://ygbgold.com/payments/gcash-qr.png',
  },
  bpi: {
    name: 'DAYLYN ORIA',
    accountNumber: '0319326193',
    qrUrl: 'https://ygbgold.com/payments/bpi-qr.png',
  },
};

const SHIPPING_LABELS: Record<string, string> = {
  philippines: 'Philippines (LBC)',
  thkrjpau: 'Thailand / Korea / Japan / Australia',
  sghktw: 'Singapore / Hong Kong / Taiwan',
  caus: 'Canada / United States',
};

interface InvoiceOrder {
  order_number: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_country_group: string;
  amount: number;
  shipping_fee: number;
  property_title: string;
}

const emailHeader = `
  <tr>
    <td style="background:#000000;padding:28px 40px;text-align:center;">
      <img src="https://ygbgold.com/Image/YGB_Logo_Trimmed.png" alt="YGB Gold" height="60" style="display:block;margin:0 auto;" />
      <p style="color:#d4af37;margin:10px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Buy Gold &amp; Sell</p>
    </td>
  </tr>`;

const emailFooter = `
  <tr>
    <td style="background:#000;padding:20px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#888;">YGB Buy Gold &amp; Sell &nbsp;|&nbsp; ygbgold.com</p>
      <p style="margin:4px 0 0;font-size:12px;color:#888;">Questions? Email us at <a href="mailto:contact@mail.ygbgold.com" style="color:#d4af37;text-decoration:none;">contact@mail.ygbgold.com</a></p>
    </td>
  </tr>`;

const emailWrapper = (content: string) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        ${emailHeader}
        ${content}
        ${emailFooter}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export function getOrderInvoiceHTML(order: InvoiceOrder): string {
  const itemPrice = order.amount - order.shipping_fee;
  const grandTotal = order.amount;
  const shippingLabel = SHIPPING_LABELS[order.shipping_country_group] || order.shipping_country_group;

  const formatPHP = (val: number) =>
    `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return emailWrapper(`
    <!-- Title -->
    <tr>
      <td style="padding:28px 40px 0;text-align:center;">
        <h1 style="margin:0;font-size:22px;color:#111;">Order Reserved!</h1>
        <p style="color:#666;margin:6px 0 0;font-size:14px;">Order #<strong>${order.order_number}</strong></p>
      </td>
    </tr>

    <!-- Customer Info -->
    <tr>
      <td style="padding:24px 40px 0;">
        <p style="margin:0 0 4px;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">Reserved by</p>
        <p style="margin:0;font-size:15px;color:#111;font-weight:bold;">${order.customer_name}</p>
        <p style="margin:2px 0 0;font-size:14px;color:#555;">${order.customer_email} &nbsp;|&nbsp; ${order.customer_phone}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#555;">Ship to: ${order.shipping_address}</p>
      </td>
    </tr>

    <!-- Divider -->
    <tr><td style="padding:20px 40px;"><hr style="border:none;border-top:1px solid #eee;margin:0;" /></td></tr>

    <!-- Itemized Table -->
    <tr>
      <td style="padding:0 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#999;padding-bottom:8px;text-transform:uppercase;letter-spacing:1px;">Item</td>
            <td style="font-size:13px;color:#999;padding-bottom:8px;text-align:right;text-transform:uppercase;letter-spacing:1px;">Amount</td>
          </tr>
          <tr>
            <td style="font-size:15px;color:#111;padding:8px 0;">${order.property_title}</td>
            <td style="font-size:15px;color:#111;padding:8px 0;text-align:right;">${formatPHP(itemPrice)}</td>
          </tr>
          <tr>
            <td style="font-size:15px;color:#111;padding:8px 0;">Shipping — ${shippingLabel}</td>
            <td style="font-size:15px;color:#111;padding:8px 0;text-align:right;">${formatPHP(order.shipping_fee)}</td>
          </tr>
          <tr>
            <td colspan="2"><hr style="border:none;border-top:1px solid #eee;margin:12px 0;" /></td>
          </tr>
          <tr>
            <td style="font-size:17px;font-weight:bold;color:#111;padding-bottom:4px;">Grand Total</td>
            <td style="font-size:17px;font-weight:bold;color:#d4af37;padding-bottom:4px;text-align:right;">${formatPHP(grandTotal)}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Divider -->
    <tr><td style="padding:20px 40px;"><hr style="border:none;border-top:1px solid #eee;margin:0;" /></td></tr>

    <!-- Payment Section -->
    <tr>
      <td style="padding:0 40px;">
        <h2 style="font-size:16px;color:#111;margin:0 0 6px;">Payment Details</h2>
        <p style="margin:0 0 16px;font-size:14px;color:#d4af37;font-weight:bold;">Please use Order #${order.order_number} as your payment reference.</p>

        <!-- GCash -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:#f9f9f9;border-radius:8px;padding:16px;">
          <tr>
            <td style="vertical-align:top;padding-right:16px;">
              <p style="margin:0;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">GCash</p>
              <p style="margin:4px 0 0;font-size:15px;font-weight:bold;color:#111;">${PAYMENT_METHODS.gcash.name}</p>
              <p style="margin:2px 0 0;font-size:14px;color:#555;">${PAYMENT_METHODS.gcash.number}</p>
            </td>
            <td style="vertical-align:top;text-align:right;">
              <img src="${PAYMENT_METHODS.gcash.qrUrl}" alt="GCash QR" width="160" style="border-radius:6px;" />
            </td>
          </tr>
        </table>

        <!-- BPI -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:8px;padding:16px;">
          <tr>
            <td style="vertical-align:top;padding-right:16px;">
              <p style="margin:0;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">BPI Bank</p>
              <p style="margin:4px 0 0;font-size:15px;font-weight:bold;color:#111;">${PAYMENT_METHODS.bpi.name}</p>
              <p style="margin:2px 0 0;font-size:14px;color:#555;">Acct: ${PAYMENT_METHODS.bpi.accountNumber}</p>
            </td>
            <td style="vertical-align:top;text-align:right;">
              <img src="${PAYMENT_METHODS.bpi.qrUrl}" alt="BPI QR" width="160" style="border-radius:6px;" />
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:28px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbea;border-left:4px solid #d4af37;border-radius:4px;padding:16px;">
          <tr>
            <td>
              <p style="margin:0;font-size:15px;color:#111;line-height:1.6;">
                <strong>Next step:</strong> Please reply to this email with a <strong>screenshot of your payment receipt</strong> to begin processing your order.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`);
}

export interface ShippedOrderData {
  order_number: number;
  customer_name: string;
  customer_email: string;
  property_title: string;
  tracking_number: string;
  shipping_carrier: string;
}

export function getOrderShippedHTML(order: ShippedOrderData): string {
  return emailWrapper(`
    <!-- Title -->
    <tr>
      <td style="padding:36px 40px 0;text-align:center;">
        <div style="width:64px;height:64px;background:#e3f2fd;border-radius:50%;display:inline-block;line-height:64px;text-align:center;margin-bottom:16px;">
          <span style="font-size:32px;line-height:64px;">📦</span>
        </div>
        <h1 style="margin:0;font-size:24px;color:#111;">Your Order Has Shipped!</h1>
        <p style="color:#666;margin:8px 0 0;font-size:14px;">Order #<strong>${order.order_number}</strong></p>
      </td>
    </tr>

    <!-- Message -->
    <tr>
      <td style="padding:28px 40px 0;">
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
          Dear <strong>${order.customer_name}</strong>,
        </p>
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
          We are pleased to inform you that your gold investment — <strong>${order.property_title}</strong> (Order #${order.order_number}) — has now been shipped and is on its way to you!
        </p>
      </td>
    </tr>

    <!-- Tracking box -->
    <tr>
      <td style="padding:16px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border-left:4px solid #1a73e8;border-radius:4px;padding:20px;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Shipping Carrier</p>
              <p style="margin:0 0 16px;font-size:17px;font-weight:bold;color:#111;">${order.shipping_carrier}</p>
              <p style="margin:0 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Tracking Number</p>
              <p style="margin:0;font-size:20px;font-weight:bold;color:#1a73e8;font-family:monospace,Arial;">${order.tracking_number}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Instructions -->
    <tr>
      <td style="padding:8px 40px 24px;">
        <p style="font-size:14px;color:#555;line-height:1.7;margin:0;">
          You can use the tracking number above on the <strong>${order.shipping_carrier}</strong> website or app to monitor your delivery status in real time.
        </p>
      </td>
    </tr>

    <!-- Divider -->
    <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #eee;margin:0;" /></td></tr>

    <!-- Sign off -->
    <tr>
      <td style="padding:28px 40px 32px;">
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
          Thank you once again for being a valued customer of <strong>YGB Gold Buy &amp; Sell</strong>. Your trust in us means everything, and we hope your gold investment brings you lasting value and peace of mind.
        </p>
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0;">
          If you have any questions about your delivery, please don't hesitate to reply to this email.<br/><br/>
          Warm regards,<br/>
          <strong style="color:#111;">The YGB Gold Team</strong><br/>
          <a href="https://ygbgold.com" style="color:#d4af37;text-decoration:none;font-size:13px;">ygbgold.com</a>
        </p>
      </td>
    </tr>`);
}

export interface ConfirmedOrderData {
  order_number: number;
  customer_name: string;
  customer_email: string;
  property_title: string;
}

export interface CancelledOrderData {
  order_number: number;
  customer_name: string;
  customer_email: string;
  property_title: string;
}

export function getOrderCancelledHTML(order: CancelledOrderData): string {
  return emailWrapper(`
    <!-- Title -->
    <tr>
      <td style="padding:36px 40px 0;text-align:center;">
        <div style="width:64px;height:64px;background:#fdecea;border-radius:50%;display:inline-block;line-height:64px;text-align:center;margin-bottom:16px;">
          <span style="font-size:32px;line-height:64px;">❌</span>
        </div>
        <h1 style="margin:0;font-size:24px;color:#111;">Order Cancelled</h1>
        <p style="color:#666;margin:8px 0 0;font-size:14px;">Order #<strong>${order.order_number}</strong></p>
      </td>
    </tr>

    <!-- Message -->
    <tr>
      <td style="padding:28px 40px 0;">
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
          Dear <strong>${order.customer_name}</strong>,
        </p>
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
          We're writing to let you know that your order for <strong>${order.property_title}</strong> (Order #${order.order_number}) has been cancelled.
        </p>
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
          If you believe this was a mistake, or if you have already sent your payment, please do not worry — simply reply to this email with your proof of payment and we will restore your order immediately.
        </p>
      </td>
    </tr>

    <!-- Info box -->
    <tr>
      <td style="padding:16px 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f5;border-left:4px solid #e53e3e;border-radius:4px;padding:16px;">
          <tr>
            <td>
              <p style="margin:0;font-size:14px;color:#333;line-height:1.7;">
                <strong>Still interested in this item?</strong><br/>
                You're welcome to browse our latest listings and place a new order at any time.<br/>
                <a href="https://ygbgold.com" style="color:#d4af37;text-decoration:none;font-weight:bold;">Browse YGB Gold →</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Divider -->
    <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #eee;margin:0;" /></td></tr>

    <!-- Sign off -->
    <tr>
      <td style="padding:28px 40px 32px;">
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0;">
          We appreciate your interest in YGB Gold and hope to serve you again soon.<br/><br/>
          Warm regards,<br/>
          <strong style="color:#111;">The YGB Gold Team</strong><br/>
          <a href="https://ygbgold.com" style="color:#d4af37;text-decoration:none;font-size:13px;">ygbgold.com</a>
        </p>
      </td>
    </tr>`);
}

export interface ReminderOrderData {
  order_number: number;
  customer_name: string;
  customer_email: string;
  property_title: string;
  amount: number;
  days_since_order: number;
}

export function getOrderReminderHTML(order: ReminderOrderData): string {
  const formatPHP = (val: number) =>
    `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return emailWrapper(`
    <!-- Title -->
    <tr>
      <td style="padding:36px 40px 0;text-align:center;">
        <div style="width:64px;height:64px;background:#fffbea;border-radius:50%;display:inline-block;line-height:64px;text-align:center;margin-bottom:16px;">
          <span style="font-size:32px;line-height:64px;">⏰</span>
        </div>
        <h1 style="margin:0;font-size:24px;color:#111;">Friendly Payment Reminder</h1>
        <p style="color:#666;margin:8px 0 0;font-size:14px;">Order #<strong>${order.order_number}</strong></p>
      </td>
    </tr>

    <!-- Message -->
    <tr>
      <td style="padding:28px 40px 0;">
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
          Dear <strong>${order.customer_name}</strong>,
        </p>
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
          Just a friendly reminder that it has been <strong>${order.days_since_order} day${order.days_since_order !== 1 ? 's' : ''}</strong> since you reserved <strong>${order.property_title}</strong> (Order #${order.order_number}) for a total of <strong>${formatPHP(order.amount)}</strong>.
        </p>
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
          We are still holding this item for you! To confirm your order, please complete your payment using the details below.
        </p>
      </td>
    </tr>

    <!-- Already paid? -->
    <tr>
      <td style="padding:0 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbea;border-left:4px solid #d4af37;border-radius:4px;padding:16px;">
          <tr>
            <td>
              <p style="margin:0;font-size:14px;color:#333;line-height:1.7;">
                <strong>Already paid?</strong> No worries at all! Simply reply to this email with a screenshot of your payment receipt and we will confirm your order right away.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Divider -->
    <tr><td style="padding:0 40px 20px;"><hr style="border:none;border-top:1px solid #eee;margin:0;" /></td></tr>

    <!-- Payment Section -->
    <tr>
      <td style="padding:0 40px;">
        <h2 style="font-size:16px;color:#111;margin:0 0 6px;">Payment Details</h2>
        <p style="margin:0 0 16px;font-size:14px;color:#d4af37;font-weight:bold;">Please use Order #${order.order_number} as your payment reference.</p>

        <!-- GCash -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;background:#f9f9f9;border-radius:8px;padding:16px;">
          <tr>
            <td style="vertical-align:top;padding-right:16px;">
              <p style="margin:0;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">GCash</p>
              <p style="margin:4px 0 0;font-size:15px;font-weight:bold;color:#111;">${PAYMENT_METHODS.gcash.name}</p>
              <p style="margin:2px 0 0;font-size:14px;color:#555;">${PAYMENT_METHODS.gcash.number}</p>
            </td>
            <td style="vertical-align:top;text-align:right;">
              <img src="${PAYMENT_METHODS.gcash.qrUrl}" alt="GCash QR" width="140" style="border-radius:6px;" />
            </td>
          </tr>
        </table>

        <!-- BPI -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:8px;padding:16px;">
          <tr>
            <td style="vertical-align:top;padding-right:16px;">
              <p style="margin:0;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">BPI Bank</p>
              <p style="margin:4px 0 0;font-size:15px;font-weight:bold;color:#111;">${PAYMENT_METHODS.bpi.name}</p>
              <p style="margin:2px 0 0;font-size:14px;color:#555;">Acct: ${PAYMENT_METHODS.bpi.accountNumber}</p>
            </td>
            <td style="vertical-align:top;text-align:right;">
              <img src="${PAYMENT_METHODS.bpi.qrUrl}" alt="BPI QR" width="140" style="border-radius:6px;" />
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Sign off -->
    <tr>
      <td style="padding:28px 40px 32px;">
        <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 16px;">
          If you have any questions or need assistance, please don't hesitate to reply to this email or contact us at <a href="mailto:contact@mail.ygbgold.com" style="color:#d4af37;">contact@mail.ygbgold.com</a>.
        </p>
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0;">
          Warm regards,<br/>
          <strong style="color:#111;">The YGB Gold Team</strong><br/>
          <a href="https://ygbgold.com" style="color:#d4af37;text-decoration:none;font-size:13px;">ygbgold.com</a>
        </p>
      </td>
    </tr>`);
}

export function getOrderConfirmedHTML(order: ConfirmedOrderData): string {
  return emailWrapper(`
    <!-- Title -->
    <tr>
      <td style="padding:36px 40px 0;text-align:center;">
        <div style="width:64px;height:64px;background:#e8f5e9;border-radius:50%;display:inline-block;line-height:64px;text-align:center;margin-bottom:16px;">
          <span style="font-size:32px;line-height:64px;">✅</span>
        </div>
        <h1 style="margin:0;font-size:24px;color:#111;">Payment Confirmed!</h1>
        <p style="color:#666;margin:8px 0 0;font-size:14px;">Order #<strong>${order.order_number}</strong></p>
      </td>
    </tr>

    <!-- Message -->
    <tr>
      <td style="padding:28px 40px 0;">
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
          Dear <strong>${order.customer_name}</strong>,
        </p>
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
          Thank you so much for your order of <strong>${order.property_title}</strong> (Order #${order.order_number}). We are delighted to confirm that your payment has been received in full.
        </p>
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
          We will now begin processing and sourcing your item, which typically takes <strong>3–5 business days</strong> to ship. Once your item has been dispatched, you will receive a follow-up email containing your <strong>shipment tracking number</strong> so you can monitor your delivery.
        </p>
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0;">
          Thank you for investing in gold and trusting YGB Gold. We truly appreciate your support, and we look forward to serving you again in the future.
        </p>
      </td>
    </tr>

    <!-- Gold highlight box -->
    <tr>
      <td style="padding:28px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbea;border-left:4px solid #d4af37;border-radius:4px;padding:16px;">
          <tr>
            <td>
              <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
                <strong>What happens next?</strong><br/>
                1. We source &amp; prepare your gold item (3–5 business days).<br/>
                2. We ship your order and send you a tracking number by email.<br/>
                3. Your item arrives safely at your door.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Sign off -->
    <tr>
      <td style="padding:0 40px 32px;">
        <p style="font-size:15px;color:#333;line-height:1.7;margin:0;">
          Warm regards,<br/>
          <strong style="color:#111;">The YGB Gold Team</strong><br/>
          <a href="https://ygbgold.com" style="color:#d4af37;text-decoration:none;font-size:13px;">ygbgold.com</a>
        </p>
      </td>
    </tr>`);
}
