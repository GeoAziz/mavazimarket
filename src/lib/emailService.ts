
import nodemailer from 'nodemailer';
import type { Order, User } from './types'; // Assuming you might want to type orderDetails

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  // Consider adding connection timeout and other options for robustness
  // logger: true, // Enable logging for debugging SMTP issues
  // debug: true,  // Enable debugging output
});

// Ensure environment variables are loaded
if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
  console.error("Email service credentials are not set in environment variables.");
  // In a real app, you might want to throw an error or disable email sending
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string; // Optional plain text version
}

async function sendEmail(options: EmailOptions) {
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.error("Email service not configured. Skipping email send.");
    return { success: false, error: "Email service not configured." };
  }
  try {
    const mailOptions = {
      from: `"Mavazi Market" <${process.env.GMAIL_EMAIL}>`,
      ...options,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendOrderConfirmationEmail(email: string, order: Order, customerName: string) {
  const subject = `Your Mavazi Market Order #${order.id.substring(0,8)} Confirmed!`;
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 5px; border-bottom: 1px solid #eee;">${item.name} (x${item.quantity})</td>
      <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: right;">KSh ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h1 style="color: #DC143C; text-align: center;">Thank You for Your Order, ${customerName}!</h1>
        <p>Your order with Mavazi Market has been successfully placed.</p>
        <p><strong>Order ID:</strong> #${order.id.substring(0,8)}</p>
        <p><strong>Order Date:</strong> ${new Date(order.orderDate as string).toLocaleDateString()}</p>
        
        <h3 style="margin-top: 20px; border-bottom: 2px solid #DC143C; padding-bottom: 5px;">Order Summary:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ccc;">Item</th>
              <th style="text-align: right; padding: 5px; border-bottom: 1px solid #ccc;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding-top: 10px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding-top: 10px; text-align: right; font-weight: bold;">KSh ${order.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <p><strong>Shipping Address:</strong></p>
        <p>
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.postalCode || ''}<br>
          ${order.shippingAddress.country}
        </p>
        
        <p>We'll notify you once your order has shipped. You can view your order details in your account dashboard.</p>
        <p style="text-align: center; margin-top: 25px;">
          <a href="https://your-mavazi-market-domain.com/profile/orders" style="background-color: #FF7F50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Order</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.9em; text-align: center; color: #777;">
          If you have any questions, please contact our support team at support@mavazimarket.co.ke.<br>
          Mavazi Market | Nairobi, Kenya
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendWelcomeEmail(email: string, userName: string) {
  const subject = `Karibu to Mavazi Market, ${userName}!`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h1 style="color: #DC143C; text-align: center;">Welcome to Mavazi Market, ${userName}!</h1>
        <p>Thank you for creating an account with us. We're excited to have you as part of our fashion community.</p>
        <p>Discover the latest trends, explore our collections, and find your unique style.</p>
        <ul style="list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">👔 Shop for Men</li>
          <li style="margin-bottom: 10px;">👗 Shop for Women</li>
          <li style="margin-bottom: 10px;">🧸 Shop for Kids</li>
        </ul>
        <p style="text-align: center; margin-top: 25px;">
          <a href="https://your-mavazi-market-domain.com" style="background-color: #FF7F50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Shopping Now</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.9em; text-align: center; color: #777;">
          Happy Shopping!<br>
          The Mavazi Market Team
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  // Note: Firebase Auth handles its own password reset emails which are generally more secure and robust.
  // This is a custom implementation example if you needed to override it.
  const subject = 'Your Mavazi Market Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h1 style="color: #DC143C; text-align: center;">Password Reset Request</h1>
        <p>Hello,</p>
        <p>We received a request to reset the password for your Mavazi Market account associated with this email address.</p>
        <p>If you made this request, please click the link below to reset your password. This link is valid for 1 hour.</p>
        <p style="text-align: center; margin: 25px 0;">
          <a href="${resetLink}" style="background-color: #FF7F50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
        </p>
        <p>If you did not request a password reset, please ignore this email or contact us if you have concerns.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.9em; text-align: center; color: #777;">
          Thank you,<br>
          The Mavazi Market Team
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
}

// You can add more email functions here:
// - sendShippingUpdateEmail
// - sendAbandonedCartEmail
// - sendPromotionalEmail
// - sendFeedbackRequestEmail
// etc.
