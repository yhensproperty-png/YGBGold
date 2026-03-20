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

interface InvoiceOrder {
  order_number: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  amount: number;
  shipping_fee: number;
  property_title: string;
}

export function getOrderInvoiceHTML(order: InvoiceOrder): string {
  const itemPrice = order.amount - order.shipping_fee;
  const grandTotal = order.amount;

  const formatPHP = (val: number) =>
    `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>YGB Gold Invoice</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#000000;padding:28px 40px;text-align:center;">
            <img src="https://ygbgold.com/Image/YGB_Logo_Trimmed.png" alt="YGB Gold" height="60" style="display:block;margin:0 auto;" />
            <p style="color:#d4af37;margin:10px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Buy Gold &amp; Sell</p>
          </td>
        </tr>

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
                <td style="font-size:15px;color:#111;padding:8px 0;">Shipping Fee</td>
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
            <h2 style="font-size:16px;color:#111;margin:0 0 16px;">Payment Details</h2>

            <!-- GCash -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:#f9f9f9;border-radius:8px;padding:16px;">
              <tr>
                <td style="vertical-align:top;padding-right:16px;">
                  <p style="margin:0;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:1px;">GCash</p>
                  <p style="margin:4px 0 0;font-size:15px;font-weight:bold;color:#111;">${PAYMENT_METHODS.gcash.name}</p>
                  <p style="margin:2px 0 0;font-size:14px;color:#555;">${PAYMENT_METHODS.gcash.number}</p>
                </td>
                <td style="vertical-align:top;text-align:right;">
                  <img src="${PAYMENT_METHODS.gcash.qrUrl}" alt="GCash QR" width="100" style="border-radius:6px;" />
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
                  <img src="${PAYMENT_METHODS.bpi.qrUrl}" alt="BPI QR" width="100" style="border-radius:6px;" />
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
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#000;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#888;">YGB Buy Gold &amp; Sell &nbsp;|&nbsp; ygbgold.com</p>
            <p style="margin:4px 0 0;font-size:12px;color:#888;">Questions? Email us at <a href="mailto:inquiries@mail.ygbgold.com" style="color:#d4af37;text-decoration:none;">inquiries@mail.ygbgold.com</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
