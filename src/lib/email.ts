import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const BRAND = {
  maroon: "#800000",
  gold: "#DFA031",
  bg: "#f7f5f3",
  cardBg: "#ffffff",
  textDark: "#1a1a1a",
  textMuted: "#666666",
  border: "#e8e0d8",
};

function emailLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:${BRAND.maroon};border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="width:40px;height:40px;background:${BRAND.gold};border-radius:8px;text-align:center;vertical-align:middle;font-size:20px;font-weight:bold;color:${BRAND.maroon};">L</td>
              <td style="padding-left:12px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">Lumbini Meat & Grocery</td>
            </tr>
          </table>
        </td></tr>
        <!-- Body Card -->
        <tr><td style="background:${BRAND.cardBg};padding:32px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:${BRAND.cardBg};border-top:1px solid ${BRAND.border};border-radius:0 0 12px 12px;padding:20px 32px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};">
          <p style="margin:0;font-size:12px;color:${BRAND.textMuted};text-align:center;line-height:1.6;">
            Lumbini Meat & Grocery &bull; Melbourne, VIC 3000<br>
            <a href="mailto:support@lumbinimeat.com.au" style="color:${BRAND.maroon};text-decoration:none;">support@lumbinimeat.com.au</a> &bull; (03) 9123 4567
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmation(
  to: string,
  orderNumber: string,
  total: number,
  items: { name: string; quantity: number; price: number }[]
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("Resend API key not configured, skipping email");
    return;
  }

  const itemRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece8;font-size:14px;color:${BRAND.textDark};">${i.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece8;font-size:14px;color:${BRAND.textMuted};text-align:center;">x${i.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece8;font-size:14px;color:${BRAND.textDark};text-align:right;font-weight:500;">$${(i.price * i.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;color:${BRAND.textDark};font-weight:700;">Thank you for your order!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textMuted};line-height:1.5;">Your order has been confirmed.</p>

    <!-- Order Number Badge -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="background:#fdf6f0;border:1px solid ${BRAND.border};border-radius:8px;padding:16px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:1px;">Order Number</p>
        <p style="margin:0;font-size:20px;font-weight:700;color:${BRAND.maroon};font-family:monospace;letter-spacing:1px;">${orderNumber}</p>
      </td></tr>
    </table>

    <!-- Items Table -->
    <h2 style="margin:0 0 12px;font-size:16px;color:${BRAND.textDark};font-weight:600;">Order Summary</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:0 0 8px;font-size:12px;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid ${BRAND.maroon};">Item</td>
        <td style="padding:0 0 8px;font-size:12px;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;text-align:center;border-bottom:2px solid ${BRAND.maroon};">Qty</td>
        <td style="padding:0 0 8px;font-size:12px;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;text-align:right;border-bottom:2px solid ${BRAND.maroon};">Price</td>
      </tr>
      ${itemRows}
    </table>

    <!-- Total -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:12px 16px;background:${BRAND.maroon};border-radius:8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:16px;color:#ffffff;font-weight:600;">Total</td>
              <td style="font-size:20px;color:${BRAND.gold};font-weight:700;text-align:right;">$${total.toFixed(2)} AUD</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">We'll notify you when your order is on its way. You can track your order anytime using your order number.</p>
  `;

  await resend.emails.send({
    from: "Lumbini Meat & Grocery <onboarding@resend.dev>",
    to,
    subject: `Order Confirmed - ${orderNumber}`,
    html: emailLayout(content),
  });
}

export async function sendOrderStatusUpdate(
  to: string,
  orderNumber: string,
  status: string
) {
  if (!process.env.RESEND_API_KEY) return;

  const statusConfig: Record<string, { message: string; color: string; icon: string }> = {
    PROCESSING: { message: "Your order is being prepared.", color: "#2563eb", icon: "⏳" },
    OUT_FOR_DELIVERY: { message: "Your order is on its way! Keep an eye out for our delivery driver.", color: "#d97706", icon: "🚚" },
    DELIVERED: { message: "Your order has been delivered. Enjoy!", color: "#16a34a", icon: "✅" },
  };

  const config = statusConfig[status] || { message: "", color: BRAND.textMuted, icon: "📦" };
  const statusLabel = status.replace(/_/g, " ");

  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;color:${BRAND.textDark};font-weight:700;">Order Update</h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textMuted};line-height:1.5;">There's an update on your order.</p>

    <!-- Order Number -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="background:#fdf6f0;border:1px solid ${BRAND.border};border-radius:8px;padding:16px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:1px;">Order Number</p>
        <p style="margin:0;font-size:20px;font-weight:700;color:${BRAND.maroon};font-family:monospace;letter-spacing:1px;">${orderNumber}</p>
      </td></tr>
    </table>

    <!-- Status Badge -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="background:${config.color};border-radius:8px;padding:16px;text-align:center;">
        <p style="margin:0 0 4px;font-size:24px;">${config.icon}</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:1px;">${statusLabel}</p>
      </td></tr>
    </table>

    <p style="margin:0;font-size:15px;color:${BRAND.textDark};line-height:1.6;">${config.message}</p>
  `;

  await resend.emails.send({
    from: "Lumbini Meat & Grocery <onboarding@resend.dev>",
    to,
    subject: `Order Update - ${orderNumber}`,
    html: emailLayout(content),
  });
}
