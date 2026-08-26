import nodemailer from "nodemailer";
import { getSettings } from "./settings";
import type { Order } from "./types";

// Cache transporter keyed by user+pass so changing settings in admin picks up
let cachedTransporter: { key: string; transporter: nodemailer.Transporter } | null = null;

function isPlaceholder(v: string) {
  return !v || v.includes("yourgmail") || v.includes("your-16-char") || v.includes("xxxx");
}

/**
 * Build a nodemailer transporter from DB-stored Gmail credentials (with env fallback).
 * Returns null if not configured.
 */
async function getTransporter(): Promise<nodemailer.Transporter | null> {
  const settings = await getSettings();
  const user = settings.gmailUser;
  const pass = settings.gmailAppPassword;
  if (isPlaceholder(user) || isPlaceholder(pass)) {
    return null;
  }
  const cacheKey = `${user}:${pass}`;
  if (cachedTransporter && cachedTransporter.key === cacheKey) {
    return cachedTransporter.transporter;
  }
  const t = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  cachedTransporter = { key: cacheKey, transporter: t };
  return t;
}

/** Check whether Gmail SMTP is fully configured (DB or env). */
export async function isEmailConfigured(): Promise<boolean> {
  const settings = await getSettings();
  return !isPlaceholder(settings.gmailUser) && !isPlaceholder(settings.gmailAppPassword);
}

function orderItemsHtml(order: Order): string {
  return order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #eee;">
          <div style="display:flex;align-items:center;gap:10px;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" width="48" height="48" style="border-radius:6px;object-fit:cover;" />` : ""}
            <div>
              <div style="font-weight:600;color:#1a1a1a;">${item.name}</div>
              ${item.weight ? `<div style="font-size:12px;color:#888;">${item.weight}</div>` : ""}
            </div>
          </div>
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">₹${item.total.toFixed(0)}</td>
      </tr>`
    )
    .join("");
}

function baseTemplate(title: string, content: string, brandName: string, tagline: string) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f3ee;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#2d6a4f 0%,#1b4332 100%);padding:24px 32px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">${brandName}</h1>
        <p style="margin:4px 0 0;color:#d8f3dc;font-size:13px;letter-spacing:1px;text-transform:uppercase;">${tagline}</p>
      </div>
      <!-- Content -->
      <div style="padding:32px;">
        ${content}
      </div>
      <!-- Footer -->
      <div style="background:#f9f7f2;padding:20px 32px;border-top:1px solid #eee;text-align:center;">
        <p style="margin:0;color:#888;font-size:12px;">© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
        <p style="margin:6px 0 0;color:#aaa;font-size:11px;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </body>
  </html>`;
}

export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const t = await getTransporter();
  if (!t) {
    console.log("[email] Gmail not configured, skipping order confirmation email for", order.orderNumber);
    return false;
  }
  const settings = await getSettings();
  const content = `
    <h2 style="margin:0 0 8px;color:#1a1a1a;">Thank you for your order, ${order.customerName}! 🎉</h2>
    <p style="margin:0 0 20px;color:#555;">Your order has been confirmed and is being processed. Here are the details:</p>

    <div style="background:#f9f7f2;border-radius:8px;padding:16px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="color:#888;font-size:13px;">Order Number</span>
        <span style="font-weight:700;color:#2d6a4f;">${order.orderNumber}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="color:#888;font-size:13px;">Order Date</span>
        <span style="color:#1a1a1a;font-size:13px;">${new Date(order.createdAt).toLocaleString("en-IN")}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="color:#888;font-size:13px;">Payment Status</span>
        <span style="color:${order.paymentStatus === "PAID" ? "#2d6a4f" : "#b8860b"};font-weight:600;font-size:13px;">${order.paymentStatus}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#888;font-size:13px;">Order Status</span>
        <span style="color:#1a1a1a;font-size:13px;">${order.status}</span>
      </div>
    </div>

    <h3 style="margin:0 0 12px;color:#1a1a1a;font-size:16px;">Order Summary</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr style="background:#f9f7f2;">
          <th style="padding:10px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;">Product</th>
          <th style="padding:10px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;">Qty</th>
          <th style="padding:10px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHtml(order)}
      </tbody>
    </table>

    <div style="background:#f9f7f2;border-radius:8px;padding:16px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="color:#555;font-size:13px;">Subtotal</span>
        <span style="color:#1a1a1a;">₹${order.subtotal.toFixed(0)}</span>
      </div>
      ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:#555;font-size:13px;">Discount${order.couponCode ? ` (${order.couponCode})` : ""}</span><span style="color:#2d6a4f;">-₹${order.discount.toFixed(0)}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="color:#555;font-size:13px;">Shipping</span>
        <span style="color:#1a1a1a;">${order.shipping === 0 ? "FREE" : "₹" + order.shipping.toFixed(0)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:2px solid #2d6a4f;margin-top:6px;">
        <span style="font-weight:700;color:#1a1a1a;">Total Paid</span>
        <span style="font-weight:700;color:#2d6a4f;font-size:18px;">₹${order.total.toFixed(0)}</span>
      </div>
    </div>

    <h3 style="margin:0 0 12px;color:#1a1a1a;font-size:16px;">Shipping Address</h3>
    <div style="background:#f9f7f2;border-radius:8px;padding:16px;margin-bottom:20px;color:#555;font-size:14px;line-height:1.6;">
      <strong style="color:#1a1a1a;">${order.customerName}</strong><br>
      ${order.address}<br>
      ${order.city}, ${order.state} - ${order.pincode}<br>
      📞 ${order.phone}<br>
      ✉️ ${order.email}
    </div>

    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:6px;margin-bottom:8px;">
      <p style="margin:0;color:#92400e;font-size:13px;">📦 Your order will be shipped within 1-2 business days and delivered in 3-7 days. You'll receive tracking updates via email.</p>
    </div>

    <p style="margin:24px 0 0;color:#888;font-size:13px;text-align:center;">Questions? Reply to this email or contact us at ${settings.email}</p>
  `;
  const html = baseTemplate(`Order Confirmed - ${order.orderNumber}`, content, settings.brandName, settings.tagline);

  try {
    await t.sendMail({
      from: `"${settings.brandName}" <${settings.gmailUser || process.env.GMAIL_USER}>`,
      to: order.email,
      subject: `✅ Order Confirmed — ${order.orderNumber} | ${settings.brandName}`,
      html,
    });
    console.log("[email] Order confirmation sent to", order.email);
    return true;
  } catch (e) {
    console.error("[email] Failed to send confirmation:", e);
    return false;
  }
}

export async function sendAdminOrderNotification(order: Order): Promise<boolean> {
  const t = await getTransporter();
  if (!t) {
    console.log("[email] Gmail not configured, skipping admin notification for", order.orderNumber);
    return false;
  }
  const settings = await getSettings();
  const content = `
    <h2 style="margin:0 0 8px;color:#1a1a1a;">🛎️ New Order Received!</h2>
    <p style="margin:0 0 20px;color:#555;">A new order has been placed on your store.</p>

    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
      <p style="margin:0;color:#92400e;font-size:14px;"><strong>Order:</strong> ${order.orderNumber} &nbsp;|&nbsp; <strong>Total:</strong> ₹${order.total.toFixed(0)} &nbsp;|&nbsp; <strong>Payment:</strong> ${order.paymentStatus}</p>
    </div>

    <h3 style="margin:0 0 12px;color:#1a1a1a;font-size:16px;">Customer Details</h3>
    <div style="background:#f9f7f2;border-radius:8px;padding:16px;margin-bottom:20px;color:#555;font-size:14px;line-height:1.7;">
      <strong style="color:#1a1a1a;">${order.customerName}</strong><br>
      📞 ${order.phone}<br>
      ✉️ ${order.email}<br>
      📍 ${order.address}, ${order.city}, ${order.state} - ${order.pincode}
      ${order.notes ? `<br><br><em>Notes: ${order.notes}</em>` : ""}
    </div>

    <h3 style="margin:0 0 12px;color:#1a1a1a;font-size:16px;">Items Ordered</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr style="background:#f9f7f2;">
          <th style="padding:10px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;">Product</th>
          <th style="padding:10px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;">Qty</th>
          <th style="padding:10px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHtml(order)}
      </tbody>
    </table>

    <div style="background:#f9f7f2;border-radius:8px;padding:16px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:#555;font-size:13px;">Subtotal</span><span>₹${order.subtotal.toFixed(0)}</span></div>
      ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:#555;font-size:13px;">Discount</span><span style="color:#2d6a4f;">-₹${order.discount.toFixed(0)}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:#555;font-size:13px;">Shipping</span><span>${order.shipping === 0 ? "FREE" : "₹" + order.shipping.toFixed(0)}</span></div>
      <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:2px solid #2d6a4f;margin-top:6px;"><strong>Total</strong><strong style="color:#2d6a4f;font-size:18px;">₹${order.total.toFixed(0)}</strong></div>
    </div>

    <p style="margin:20px 0 0;color:#888;font-size:13px;">Payment ID: ${order.razorpayPaymentId || "N/A"} | Order ID: ${order.razorpayOrderId || "N/A"}</p>
  `;
  const html = baseTemplate(`New Order — ${order.orderNumber}`, content, settings.brandName, settings.tagline);

  try {
    await t.sendMail({
      from: `"${settings.brandName}" <${settings.gmailUser || process.env.GMAIL_USER}>`,
      to: settings.storeNotifyEmail || process.env.STORE_NOTIFY_EMAIL,
      subject: `🛎️ New Order ${order.orderNumber} — ₹${order.total.toFixed(0)} | ${settings.brandName}`,
      html,
    });
    console.log("[email] Admin notification sent for", order.orderNumber);
    return true;
  } catch (e) {
    console.error("[email] Failed to send admin notification:", e);
    return false;
  }
}

export async function sendContactEmail(name: string, email: string, phone: string, subject: string, message: string): Promise<boolean> {
  const t = await getTransporter();
  if (!t) return false;
  const settings = await getSettings();
  const content = `
    <h2 style="margin:0 0 8px;color:#1a1a1a;">📬 New Contact Message</h2>
    <div style="background:#f9f7f2;border-radius:8px;padding:16px;margin:20px 0;color:#555;font-size:14px;line-height:1.7;">
      <strong style="color:#1a1a1a;">${name}</strong><br>
      ✉️ ${email}<br>
      📞 ${phone || "N/A"}<br>
      <strong>Subject:</strong> ${subject}
    </div>
    <p style="color:#555;font-size:14px;line-height:1.7;">${message}</p>
  `;
  const html = baseTemplate(`Contact: ${subject}`, content, settings.brandName, settings.tagline);
  try {
    await t.sendMail({
      from: `"${settings.brandName}" <${settings.gmailUser || process.env.GMAIL_USER}>`,
      to: settings.storeNotifyEmail || process.env.STORE_NOTIFY_EMAIL,
      replyTo: email,
      subject: `📬 Contact: ${subject}`,
      html,
    });
    return true;
  } catch (e) {
    console.error("[email] Failed contact email:", e);
    return false;
  }
}

/**
 * Send a test email to verify the Gmail SMTP configuration.
 * Returns { ok, message }.
 */
export async function sendTestEmail(toEmail?: string): Promise<{ ok: boolean; message: string }> {
  const settings = await getSettings();
  const t = await getTransporter();
  if (!t) {
    return {
      ok: false,
      message: "Gmail credentials are not configured. Enter your Gmail address and 16-character App Password.",
    };
  }
  const target = toEmail || settings.storeNotifyEmail || settings.gmailUser;
  if (!target) {
    return { ok: false, message: "No recipient email. Set a 'Store Notification Email' first." };
  }
  const content = `
    <h2 style="margin:0 0 8px;color:#1a1a1a;">📧 Test Email from ${settings.brandName}</h2>
    <p style="margin:0 0 20px;color:#555;">This is a test email to confirm your Gmail SMTP configuration is working correctly.</p>
    <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
      <p style="margin:0;color:#065f46;font-size:14px;"><strong>✅ Success!</strong> Your email integration is properly configured.</p>
      <p style="margin:6px 0 0;color:#065f46;font-size:13px;">Order confirmation emails will be sent to customers, and order notifications will be sent to <strong>${settings.storeNotifyEmail || settings.gmailUser}</strong>.</p>
    </div>
    <p style="margin:0;color:#888;font-size:13px;">Sent at: ${new Date().toLocaleString("en-IN")}</p>
  `;
  const html = baseTemplate("Test Email — SMTP Configuration", content, settings.brandName, settings.tagline);
  try {
    await t.sendMail({
      from: `"${settings.brandName}" <${settings.gmailUser}>`,
      to: target,
      subject: `✅ Test Email — ${settings.brandName} SMTP Config`,
      html,
    });
    return { ok: true, message: `✅ Test email sent successfully to ${target}! Check the inbox.` };
  } catch (e) {
    const msg = (e as Error).message || String(e);
    console.error("[email] Test email failed:", e);
    return { ok: false, message: `❌ ${msg}` };
  }
}
