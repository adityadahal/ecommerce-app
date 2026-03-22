import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const itemsList = items
    .map((i) => `${i.name} x${i.quantity} - $${(i.price * i.quantity).toFixed(2)}`)
    .join("\n");

  await resend.emails.send({
    from: "FreshMart <orders@freshmart.com.au>",
    to,
    subject: `Order Confirmed - ${orderNumber}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
      <h2>Order Summary</h2>
      <pre>${itemsList}</pre>
      <p><strong>Total: $${total.toFixed(2)} AUD</strong></p>
      <p>We'll notify you when your order is on its way.</p>
      <p>- The FreshMart Team</p>
    `,
  });
}

export async function sendOrderStatusUpdate(
  to: string,
  orderNumber: string,
  status: string
) {
  if (!process.env.RESEND_API_KEY) return;

  const statusMessages: Record<string, string> = {
    PROCESSING: "Your order is being prepared.",
    OUT_FOR_DELIVERY: "Your order is on its way! Keep an eye out for our delivery driver.",
    DELIVERED: "Your order has been delivered. Enjoy your groceries!",
  };

  await resend.emails.send({
    from: "FreshMart <orders@freshmart.com.au>",
    to,
    subject: `Order Update - ${orderNumber}`,
    html: `
      <h1>Order Update</h1>
      <p>Your order <strong>${orderNumber}</strong> status has been updated.</p>
      <p><strong>Status: ${status.replace(/_/g, " ")}</strong></p>
      <p>${statusMessages[status] || ""}</p>
      <p>- The FreshMart Team</p>
    `,
  });
}
