
import nodemailer from 'nodemailer';
import type { Order } from './types'; // Assuming you might want to type orderDetails

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Ensure environment variables are loaded and log status
if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
  console.error("CRITICAL: Email service credentials (GMAIL_EMAIL or GMAIL_APP_PASSWORD) are not set in environment variables. Email sending will be disabled.");
} else {
  console.log("Email service configured with provided credentials.");
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string; // Optional plain text version
}

async function sendEmail(options: EmailOptions) {
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.error("Email service not configured. Skipping email send for: ", options.to, options.subject);
    return { success: false, error: "Email service not configured. Missing credentials." };
  }
  try {
    const mailOptions = {
      from: `"Mavazi Market" <${process.env.GMAIL_EMAIL}>`,
      ...options,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', options.to, 'Subject:', options.subject, 'Response:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email to:', options.to, 'Subject:', options.subject, 'Error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// --- Helper for Email Styling ---
const primaryColor = "#DC143C"; // Deep Crimson
const accentColor = "#FF7F50";   // Warm Coral
const backgroundColor = "#FAF9F6"; // Off-white
const textColor = "#333333";

const emailStyles = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: ${textColor}; background-color: ${backgroundColor}; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 25px; border: 1px solid #dddddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
  .header { text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid ${primaryColor};}
  .header h1 { color: ${primaryColor}; font-size: 26px; margin: 0; }
  .header .logo-accent { color: ${accentColor}; }
  .content-section { margin-bottom: 20px; }
  .content-section h3 { margin-top: 25px; border-bottom: 1px solid #eeeeee; padding-bottom: 8px; font-size: 18px; color: ${primaryColor}; }
  .button-cta { background-color: ${accentColor}; color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .footer { font-size: 14px; text-align: center; color: #777777; margin-top: 25px; padding-top: 15px; border-top: 1px solid #eeeeee; }
  .footer a { color: ${primaryColor}; text-decoration: none; }
  table { width: 100%; border-collapse: collapse; font-size: 15px; }
  th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eeeeee; }
  th { background-color: #f8f8f8; font-weight: bold; }
  .item-image { border-radius: 4px; margin-right: 10px; vertical-align: middle; }
  .total-row strong { font-size: 16px; }
  .total-amount { font-size: 18px; color: ${primaryColor}; font-weight: bold; }
  .address-box { background-color: #f9f9f9; padding: 12px; border-radius: 4px; font-size: 15px; }
  ul.features { list-style: none; padding: 0; margin: 20px 0; font-size: 15px; }
  ul.features li { margin-bottom: 10px; padding-left: 25px; position: relative; }
  ul.features li::before { content: '✔'; position: absolute; left: 0; color: ${primaryColor}; font-weight: bold; }
`;

export async function sendOrderConfirmationEmail(email: string, order: Order, customerName: string) {
  const subject = `Your Mavazi Market Order #${order.id.substring(0,8)} Confirmed!`;
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="vertical-align: top;">
        <img src="${item.image}" alt="${item.name}" width="60" class="item-image">
      </td>
      <td style="vertical-align: top;">
        ${item.name} (Qty: ${item.quantity})
        ${item.size ? `<br><small>Size: ${item.size}</small>` : ''}
        ${item.color ? `<br><small>Color: ${item.color}</small>` : ''}
      </td>
      <td style="text-align: right; vertical-align: top;">KSh ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <html><head><style>${emailStyles}</style></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Order, ${customerName}!</h1>
        </div>
        <div class="content-section">
          <p>Your order with Mavazi<span class="logo-accent">Market</span> has been successfully placed and is now being processed.</p>
          <p><strong>Order ID:</strong> <span style="color: ${primaryColor};">#${order.id.substring(0,8)}</span></p>
          <p><strong>Order Date:</strong> ${new Date(order.orderDate as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        
        <div class="content-section">
          <h3>Order Summary:</h3>
          <table>
            <thead>
              <tr>
                <th colspan="2">Item Details</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding-top: 15px; text-align: right;" class="total-row"><strong>Subtotal:</strong></td>
                <td style="padding-top: 15px; text-align: right;" class="total-row"><strong>KSh ${order.totalAmount.toLocaleString()}</strong></td>
              </tr>
              <!-- Add lines for Shipping, Taxes, Discounts if applicable -->
              <tr style="border-top: 2px solid ${textColor};">
                <td colspan="2" style="padding-top: 10px; text-align: right;" class="total-amount">Total:</td>
                <td style="padding-top: 10px; text-align: right;" class="total-amount">KSh ${order.totalAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="content-section">
          <h3>Shipping Address:</h3>
          <div class="address-box">
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}${order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ''}<br>
            ${order.shippingAddress.country}
          </div>
        </div>
        
        <div class="content-section">
          <p>We'll notify you once your order has shipped. You can view your order details and track its progress in your account dashboard:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile" class="button-cta">View Your Order</a>
          </div>
        </div>
        <div class="footer">
          <p>
            If you have any questions, please contact our support team at <a href="mailto:${process.env.GMAIL_EMAIL}">${process.env.GMAIL_EMAIL}</a>.<br>
            Mavazi<span class="logo-accent">Market</span> | Nairobi, Kenya
          </p>
        </div>
      </div>
    </body></html>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendWelcomeEmail(email: string, userName: string) {
  const subject = `Karibu to Mavazi Market, ${userName}!`;
  const html = `
    <html><head><style>${emailStyles}</style></head>
    <body>
      <div class="container">
        <div class="header">
           <h1>Welcome to Mavazi<span class="logo-accent">Market</span>, ${userName}!</h1>
        </div>
        <div class="content-section">
          <p>Thank you for creating an account with us. We're thrilled to have you join our fashion community!</p>
          <p>At Mavazi<span class="logo-accent">Market</span>, you can discover the latest trends, explore unique collections, and find items that perfectly express your style.</p>
          <p>Here are a few things you can do to get started:</p>
          <ul class="features">
            <li>Explore our <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/men" style="color: ${primaryColor}; text-decoration: none; font-weight: bold;">Men's Collection</a></li>
            <li>Discover <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/women" style="color: ${primaryColor}; text-decoration: none; font-weight: bold;">Women's Fashion</a></li>
            <li>Check out adorable <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/kids" style="color: ${primaryColor}; text-decoration: none; font-weight: bold;">Kids' Wear</a></li>
            <li>Save your favorites to your <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile" style="color: ${primaryColor}; text-decoration: none; font-weight: bold;">Wishlist</a></li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button-cta">Start Shopping Now</a>
          </div>
        </div>
        <div class="footer">
          <p>
            Happy Shopping!<br>
            The Mavazi<span class="logo-accent">Market</span> Team
          </p>
        </div>
      </div>
    </body></html>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  // Note: Firebase Auth handles its own password reset emails which are generally more secure and robust.
  // This is a custom implementation example if you needed to override it AND generate your own token/link.
  const subject = `Your Mavazi Market Password Reset Request`;
  const html = `
    <html><head><style>${emailStyles}</style></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content-section">
          <p>Hello,</p>
          <p>We received a request to reset the password for your Mavazi<span class="logo-accent">Market</span> account associated with this email address.</p>
          <p>If you made this request, please click the link below to reset your password. This link is valid for a limited time.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button-cta">Reset Your Password</a>
          </div>
          <p>If you did not request a password reset, please ignore this email or contact us if you have concerns.</p>
        </div>
        <div class="footer">
          <p>
            Thank you,<br>
            The Mavazi<span class="logo-accent">Market</span> Team
          </p>
        </div>
      </div>
    </body></html>
  `;
  return sendEmail({ to: email, subject, html });
}

