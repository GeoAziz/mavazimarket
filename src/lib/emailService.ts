
import nodemailer from 'nodemailer';
import type { Order, User } from './types'; // Assuming you might want to type orderDetails

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  // logger: true, // Enable logging for debugging SMTP issues
  // debug: true,  // Enable debugging output
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

export async function sendOrderConfirmationEmail(email: string, order: Order, customerName: string) {
  const subject = `Your Mavazi Market Order #${order.id.substring(0,8)} Confirmed!`;
  const itemsHtml = order.items.map(item => `
    <tr style="border-bottom: 1px solid #eeeeee;">
      <td style="padding: 10px; vertical-align: top;">
        <img src="${item.image}" alt="${item.name}" width="50" style="border-radius: 4px; margin-right: 10px; vertical-align: middle;">
        ${item.name} (Qty: ${item.quantity})
        ${item.size ? `<br><small>Size: ${item.size}</small>` : ''}
        ${item.color ? `<br><small>Color: ${item.color}</small>` : ''}
      </td>
      <td style="padding: 10px; text-align: right; vertical-align: top;">KSh ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 25px; border: 1px solid #dddddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #DC143C; font-size: 26px; margin: 0;">Thank You for Your Order, ${customerName}!</h1>
        </div>
        <p style="font-size: 16px;">Your order with Mavazi Market has been successfully placed and is now being processed.</p>
        <p style="font-size: 16px;"><strong>Order ID:</strong> <span style="color: #DC143C;">#${order.id.substring(0,8)}</span></p>
        <p style="font-size: 16px;"><strong>Order Date:</strong> ${new Date(order.orderDate as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        
        <h3 style="margin-top: 30px; border-bottom: 2px solid #DC143C; padding-bottom: 8px; font-size: 18px; color: #DC143C;">Order Summary:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 15px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 10px; border-bottom: 1px solid #cccccc; background-color: #f2f2f2;">Item Details</th>
              <th style="text-align: right; padding: 10px; border-bottom: 1px solid #cccccc; background-color: #f2f2f2;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding-top: 15px; text-align: right; font-weight: bold; font-size: 16px;">Subtotal:</td>
              <td style="padding-top: 15px; text-align: right; font-weight: bold; font-size: 16px;">KSh ${order.totalAmount.toLocaleString()}</td>
            </tr>
            <!-- Add lines for Shipping, Taxes, Discounts if applicable -->
            <tr style="border-top: 2px solid #333333;">
              <td style="padding-top: 10px; text-align: right; font-weight: bold; font-size: 18px; color: #DC143C;">Total:</td>
              <td style="padding-top: 10px; text-align: right; font-weight: bold; font-size: 18px; color: #DC143C;">KSh ${order.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <h3 style="margin-top: 25px; font-size: 18px; color: #DC143C;">Shipping Address:</h3>
        <p style="font-size: 15px; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}${order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ''}<br>
          ${order.shippingAddress.country}
        </p>
        
        <p style="font-size: 16px;">We'll notify you once your order has shipped. You can view your order details and track its progress in your account dashboard:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://mavazi-market-project.web.app/profile" style="background-color: #FF7F50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">View Your Order</a>
        </div>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        <p style="font-size: 14px; text-align: center; color: #777777;">
          If you have any questions, please contact our support team at <a href="mailto:qaranbabyshop@gmail.com" style="color: #DC143C; text-decoration: none;">qaranbabyshop@gmail.com</a>.<br>
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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 25px; border: 1px solid #dddddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 25px;">
           <h1 style="color: #DC143C; font-size: 26px; margin: 0;">Welcome to Mavazi<span style="color: #FF7F50;">Market</span>, ${userName}!</h1>
        </div>
        <p style="font-size: 16px;">Thank you for creating an account with us. We're thrilled to have you join our fashion community!</p>
        <p style="font-size: 16px;">At Mavazi Market, you can discover the latest trends, explore unique collections, and find items that perfectly express your style.</p>
        <p style="font-size: 16px;">Here are a few things you can do to get started:</p>
        <ul style="list-style: none; padding: 0; margin: 20px 0; font-size: 15px;">
          <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #DC143C;">&#10004;</span> Explore our <a href="https://mavazi-market-project.web.app/men" style="color: #DC143C; text-decoration: none; font-weight: bold;">Men's Collection</a></li>
          <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #DC143C;">&#10004;</span> Discover <a href="https://mavazi-market-project.web.app/women" style="color: #DC143C; text-decoration: none; font-weight: bold;">Women's Fashion</a></li>
          <li style="margin-bottom: 10px; padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #DC143C;">&#10004;</span> Check out adorable <a href="https://mavazi-market-project.web.app/kids" style="color: #DC143C; text-decoration: none; font-weight: bold;">Kids' Wear</a></li>
          <li style="padding-left: 20px; position: relative;"><span style="position: absolute; left: 0; color: #DC143C;">&#10004;</span> Save your favorites to your <a href="https://mavazi-market-project.web.app/profile" style="color: #DC143C; text-decoration: none; font-weight: bold;">Wishlist</a></li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://mavazi-market-project.web.app" style="background-color: #FF7F50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Start Shopping Now</a>
        </div>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        <p style="font-size: 14px; text-align: center; color: #777777;">
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
  // This is a custom implementation example if you needed to override it AND generate your own token/link.
  const subject = 'Your Mavazi Market Password Reset Request';
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 25px; border: 1px solid #dddddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #DC143C; font-size: 26px; margin: 0;">Password Reset Request</h1>
        </div>
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">We received a request to reset the password for your Mavazi Market account associated with this email address.</p>
        <p style="font-size: 16px;">If you made this request, please click the link below to reset your password. This link is valid for a limited time.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #FF7F50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Reset Your Password</a>
        </div>
        <p style="font-size: 16px;">If you did not request a password reset, please ignore this email or contact us if you have concerns.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        <p style="font-size: 14px; text-align: center; color: #777777;">
          Thank you,<br>
          The Mavazi Market Team
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
}
