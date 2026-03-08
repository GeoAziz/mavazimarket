
import { Resend } from 'resend';
import type { Order } from './types';

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.RESEND_API_KEY) {
  console.error("CRITICAL: RESEND_API_KEY is not set. Email sending will fail.");
}

// Brand Colors from Blueprint
const BRAND_PRIMARY = "#D4501A"; // Terracotta
const BRAND_SECONDARY = "#1A1A2E"; // Midnight
const BRAND_ACCENT = "#F5A623"; // Gold
const BRAND_CREAM = "#FDF6EC";

const emailStyles = `
  body { font-family: 'Inter', sans-serif; line-height: 1.6; color: ${BRAND_SECONDARY}; background-color: ${BRAND_CREAM}; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid rgba(212, 80, 26, 0.1); }
  .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid ${BRAND_PRIMARY}; padding-bottom: 16px; }
  .header h1 { color: ${BRAND_PRIMARY}; font-size: 28px; margin: 0; font-family: 'DM Serif Display', serif; }
  .content-section { margin-bottom: 24px; }
  .status-badge { display: inline-block; padding: 8px 16px; background-color: ${BRAND_PRIMARY}; color: #ffffff; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 14px; }
  .button-cta { background-color: ${BRAND_PRIMARY}; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block; text-transform: uppercase; letter-spacing: 1px; }
  .footer { font-size: 12px; text-align: center; color: #666666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { text-align: left; padding: 12px; background-color: ${BRAND_CREAM}; color: ${BRAND_PRIMARY}; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
  td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
`;

export async function sendOrderConfirmationEmail(email: string, order: Order, customerName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Mavazi Market <orders@mavazimarket.com>',
      to: email,
      subject: `Order Confirmed: #${order.id.substring(0, 8)}`,
      html: `
        <html><head><style>${emailStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MAVAZI MARKET</h1>
            </div>
            <div class="content-section">
              <p>Hello ${customerName},</p>
              <p>Your bold choice is on its way. We've received your order and our team is preparing it with care.</p>
              <p><strong>Order ID:</strong> ${order.id.substring(0, 8)}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name} x ${item.quantity}</td>
                    <td style="text-align: right;">KSh ${item.price.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding-top: 20px; font-weight: bold; color: ${BRAND_PRIMARY};">TOTAL</td>
                  <td style="padding-top: 20px; text-align: right; font-weight: bold; color: ${BRAND_PRIMARY};">KSh ${order.totalAmount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" class="button-cta">Track Your Order</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Mavazi Market. Heritage Inspired, Modern Crafted.</p>
            </div>
          </div>
        </body></html>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function sendOrderStatusUpdateEmail(email: string, order: Order, customerName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Mavazi Market <logistics@mavazimarket.com>',
      to: email,
      subject: `Order Update: #${order.id.substring(0, 8)} is ${order.status}`,
      html: `
        <html><head><style>${emailStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MAVAZI MARKET</h1>
            </div>
            <div class="content-section" style="text-align: center;">
              <p>Hello ${customerName},</p>
              <p>Your heritage journey has reached a new milestone.</p>
              <div class="status-badge">${order.status}</div>
              <p style="margin-top: 24px;"><strong>Order ID:</strong> ${order.id.substring(0, 8)}</p>
              ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
            </div>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" class="button-cta">View Live Tracking</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Mavazi Market. Nairobi to the World.</p>
            </div>
          </div>
        </body></html>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function sendWelcomeEmail(email: string, userName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Mavazi Market <welcome@mavazimarket.com>',
      to: email,
      subject: `Karibu, ${userName}! Welcome to Mavazi Market`,
      html: `
        <html><head><style>${emailStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MAVAZI MARKET</h1>
            </div>
            <div class="content-section">
              <p>Karibu ${userName},</p>
              <p>Welcome to Kenya's premier destination for bold, Afrocentric style. We believe fashion is more than clothing—it's a statement of identity.</p>
              <p>You're now part of a community that celebrates heritage through modern craftsmanship.</p>
            </div>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button-cta">Start Exploring</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Mavazi Market. Uniquely Kenyan, Globally Inspired.</p>
            </div>
          </div>
        </body></html>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}
