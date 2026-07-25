import nodemailer from 'nodemailer';
import { Resend } from 'resend';

/**
 * Creates a transporter instance. 
 * Initializing inside a function ensures environment variables are loaded before use.
 */
const getTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error('Email credentials (GMAIL_USER/GMAIL_PASS) are not configured in environment variables.');
  }
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
};


type EmailType = 'OTP' | 'ORDER_PLACED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED';

interface EmailPayload {
  to: string;
  userName: string;
  type: EmailType;
  data?: any;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, userName, type, data } = req.body as EmailPayload;

  if (!to || !type) {
    console.error('Email API Error: Missing required fields', { to, type });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`Email Request Received: type=${type}, to=${to}`);

  let subject = '';
  let html = '';

  const logoUrl = data?.logoUrl || 'https://igo-proteincuts.vercel.app/logo.png';
  const statusImage = data?.statusImage || '';
  const message = data?.message || '';
  const items = data?.items || [];

  const itemsHtml = items.map((item: any) => `
    <div style="display: flex; align-items: center; gap: 15px; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
      <div style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; background: #f5f5f5;">
        <img src="${item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="flex: 1;">
        <p style="margin: 0; font-weight: bold; color: #333;">${item.name}</p>
        <p style="margin: 0; font-size: 12px; color: #666;">${item.weight || '500g'} × ${item.quantity}</p>
      </div>
      <p style="margin: 0; font-weight: bold; color: #2D5A27;">₹${item.price * item.quantity}</p>
    </div>
  `).join('');

  switch (type) {
    case 'OTP':
      subject = 'Your IGO Verification Code';
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; border-radius: 24px; overflow: hidden; background: #fff;">
          <div style="background: #2D5A27; padding: 30px; text-align: center;">
            <img src="${logoUrl}" style="height: 40px; margin-bottom: 10px;" />
            <h1 style="color: #fff; margin: 0; font-size: 24px;">Welcome to IGO</h1>
          </div>
          <div style="padding: 40px; text-align: center;">
            <h2 style="color: #2D5A27; margin-top: 0;">Verify Your Identity</h2>
            <p style="color: #666; font-size: 16px;">Hi ${userName}, use the code below to complete your secure login.</p>
            <div style="font-size: 42px; font-weight: bold; color: #D4AF37; letter-spacing: 8px; margin: 30px 0; background: #f9f9f9; padding: 30px; text-align: center; border-radius: 20px; border: 2px dashed #D4AF37;">
              ${data?.otp}
            </div>
            <p style="color: #999; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Premium Farm-Fresh Protein Cuts</p>
          </div>
        </div>
      `;
      break;

    case 'ORDER_PLACED':
    case 'ORDER_PACKED' as any:
    case 'ORDER_SHIPPED':
    case 'ORDER_DELIVERED':
    case 'ORDER_CANCELLED' as any:
      subject = req.body.subject || `Order Update - ${data.orderId}`;
      const isDelivered = type === 'ORDER_DELIVERED';
      
      html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; border-radius: 24px; overflow: hidden; background: #fff;">
          <!-- Header -->
          <div style="background: #2D5A27; padding: 30px; text-align: center;">
            <img src="${logoUrl}" style="height: 40px; margin-bottom: 10px;" />
            <h1 style="color: #fff; margin: 0; font-size: 24px;">${subject.split('-')[0]}</h1>
          </div>

          <!-- Status Image -->
          ${statusImage ? `
          <div style="width: 100%; height: 200px; overflow: hidden;">
            <img src="${statusImage}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          ` : ''}

          <div style="padding: 30px;">
            <p style="font-size: 18px; font-weight: bold; color: #333;">Order #${data.orderId}</p>
            <p style="color: #666; line-height: 1.6;">${message || `Hi ${userName}, thank you for your order! We're processing it now and will notify you of any updates.`}</p>

            <!-- Items -->
            <div style="margin-top: 30px;">
              <h3 style="color: #2D5A27; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #2D5A27; padding-bottom: 5px; display: inline-block;">Order Summary</h3>
              <div style="margin-top: 15px;">
                ${itemsHtml || '<p style="color: #999; font-style: italic;">Processing item details...</p>'}
              </div>
            </div>

            <!-- Summary -->
            <div style="margin-top: 20px; background: #f9f9f9; padding: 20px; border-radius: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #666;">Order Total</span>
                <span style="font-weight: bold; color: #333;">₹${data.amount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #2D5A27; font-weight: bold;">
                <span>Payment Status</span>
                <span>PAID</span>
              </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; border: 1px solid #f0f0f0; border-radius: 16px;">
              <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; font-weight: bold;">Delivery Address</p>
              <p style="margin: 5px 0 0 0; color: #333; font-size: 14px;">${data.address}</p>
            </div>

            ${isDelivered ? `
            <div style="margin-top: 30px; text-align: center;">
              <p style="font-size: 20px; font-weight: bold; color: #D4AF37;">Enjoy the food! 🍖</p>
              <p style="color: #666; margin-bottom: 20px;">We'd love to see what you cook. Tag us @IGOFresh!</p>
              <a href="${data.reviewUrl || '#'}" style="background: #2D5A27; color: #fff; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">Rate Your Experience</a>
            </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div style="background: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Premium Farm-Fresh Protein Cuts</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">© 2026 IGO Protein Cuts. All rights reserved.</p>
          </div>
        </div>
      `;
      break;

    default:
      return res.status(400).json({ error: 'Invalid email type' });
  }

  // Priority 1: Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const resData = await resend.emails.send({
        from: 'IGO Protein Cuts <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      });
      console.log('Resend Success:', resData);
      return res.status(200).json({ success: true, provider: 'resend', id: resData.id });
    } catch (error: any) {
      console.error('Resend Error, falling back to Gmail:', error);
    }
  }

  // Priority 2: Nodemailer/Gmail
  try {
    const transporter = getTransporter();
    console.log(`Attempting to send ${type} email via Gmail to ${to}...`);

    const info = await transporter.sendMail({
      from: `"IGO Protein Cuts" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log('Nodemailer Success:', info.messageId);
    return res.status(200).json({ success: true, provider: 'gmail', messageId: info.messageId });
  } catch (error: any) {
    console.error('Nodemailer Error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message || error 
    });
  }
}

