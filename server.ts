import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SUPABASE (server-only; service_role key must never reach the browser) ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isSupabaseConfigured = !!SUPABASE_URL && !!SUPABASE_SERVICE_ROLE_KEY;

async function supabaseRest(path: string, options: { method: string; body?: any; extraHeaders?: Record<string, string> }) {
  if (!isSupabaseConfigured) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY as string,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'return=representation',
      ...(options.extraHeaders || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase REST ${options.method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json().catch(() => null);
}

// --- PASSWORD HASHING (Node built-in crypto.scrypt — no extra dependency
// needed for a proper salted hash; never store or return plaintext) ---
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  const hashBuf = Buffer.from(hash, 'hex');
  const candidateBuf = Buffer.from(candidate, 'hex');
  if (hashBuf.length !== candidateBuf.length) return false;
  return crypto.timingSafeEqual(hashBuf, candidateBuf);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API ROUTES FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Protein Cuts IGO Ecosystem Server', time: new Date().toISOString() });
  });

  // AI Smart Recipe & Meat Finder Assistant endpoint
  app.post('/api/ai-search', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query string required' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are Protein Cuts IGO AI Sommelier & Meat Chef. The user asks: "${query}".
Suggest the top 2 recommended fresh meat or seafood cuts, estimated prep time, health benefits, protein density, and a quick 2-sentence recipe recommendation.
Format response as crisp structured JSON with keys:
"recommendations": [{"name": string, "category": string, "reason": string, "protein": string, "quickRecipe": string}]`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const text = response.text || '';
        res.json({ resultText: text, source: 'gemini' });
        return;
      }

      // Intelligent Fallback response if GEMINI_API_KEY is placeholder
      const queryLower = query.toLowerCase();
      let suggestions = [];
      if (queryLower.includes('chicken') || queryLower.includes('gym') || queryLower.includes('protein')) {
        suggestions.push({
          name: 'Tender Chicken Breast - Boneless',
          category: 'chicken',
          reason: 'Highest protein density (31g per 100g serving) with zero fat.',
          protein: '31g per 100g',
          quickRecipe: 'Pan sear in 1 tsp olive oil with crushed garlic, black pepper, and sea salt for 8 minutes.'
        });
      }
      if (queryLower.includes('fish') || queryLower.includes('omega') || queryLower.includes('keto')) {
        suggestions.push({
          name: 'Fresh Seer Fish / Vanjaram Steak',
          category: 'fish',
          reason: 'Loaded with Omega-3 fatty acids and lean muscle-building protein.',
          protein: '26g per 100g',
          quickRecipe: 'Shallow tawa fry with lemon juice, turmeric, and Kashmiri red chilli for crisp exterior.'
        });
      }
      if (suggestions.length === 0) {
        suggestions.push({
          name: 'Fresh Farm Chicken Curry Cut',
          category: 'chicken',
          reason: '100% Antibiotic-free, freshly dressed tender cut perfect for all healthy curries.',
          protein: '24.5g per 100g',
          quickRecipe: 'Simmer with shallots, cumin, black pepper, and curry leaves for 20 minutes.'
        });
      }

      res.json({
        resultText: JSON.stringify({ recommendations: suggestions }),
        source: 'smart-fallback'
      });
    } catch (err: any) {
      console.error('AI search error:', err);
      res.status(500).json({ error: 'Failed to process AI recommendation' });
    }
  });

  // --- OTP AUTH (real random codes; sends via SMS provider if configured, else dev fallback) ---
  const otpStore = new Map<string, { code: string; expiresAt: number }>();

  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone || typeof phone !== 'string' || phone.replace(/\D/g, '').length < 10) {
        res.status(400).json({ error: 'Valid 10-digit phone number required' });
        return;
      }

      const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
      const code = `${Math.floor(1000 + Math.random() * 9000)}`;
      otpStore.set(normalizedPhone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });

      const msg91Key = process.env.MSG91_API_KEY;
      const smsSenderId = process.env.MSG91_SENDER_ID || 'IGOPRO';

      if (msg91Key) {
        try {
          await fetch('https://control.msg91.com/api/v5/otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', authkey: msg91Key },
            body: JSON.stringify({
              mobile: `91${normalizedPhone}`,
              sender: smsSenderId,
              otp: code,
              otp_expiry: 5
            })
          });
          res.json({ success: true, sent: true, channel: 'sms' });
          return;
        } catch (smsErr) {
          console.error('MSG91 send failed, falling back to dev mode:', smsErr);
        }
      }

      // Dev/demo fallback — no SMS provider configured yet.
      // The code is returned directly so the flow stays testable until MSG91_API_KEY is added.
      console.log(`[DEV OTP] ${normalizedPhone}: ${code} (expires in 5 min)`);
      res.json({ success: true, sent: false, channel: 'dev-fallback', devOtp: code });
    } catch (err) {
      console.error('send-otp error:', err);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, code } = req.body;
    if (!phone || !code) {
      res.status(400).json({ error: 'Phone and code required' });
      return;
    }
    const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10);
    const entry = otpStore.get(normalizedPhone);

    if (!entry) {
      res.status(400).json({ success: false, error: 'No OTP requested for this number. Please request a new code.' });
      return;
    }
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(normalizedPhone);
      res.status(400).json({ success: false, error: 'OTP expired. Please request a new code.' });
      return;
    }
    if (entry.code !== String(code)) {
      res.status(400).json({ success: false, error: 'Incorrect OTP. Please try again.' });
      return;
    }

    otpStore.delete(normalizedPhone);
    res.json({ success: true });
  });

  // --- EMAIL + PASSWORD AUTH ---
  // Persists to Supabase's igo_customers table when configured (see
  // supabase/migrations/0003_customer_password_auth.sql for the
  // password_hash column); otherwise falls back to this in-memory store so
  // the flow stays fully testable without any external setup. Passwords are
  // always salted+hashed (crypto.scrypt) — never stored or returned in
  // plaintext, and never logged.
  interface StoredCustomer {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: string;
  }
  const customersStore = new Map<string, StoredCustomer>(); // keyed by lowercase email
  const passwordResetStore = new Map<string, { token: string; expiresAt: number }>();

  async function findCustomerByEmail(email: string): Promise<StoredCustomer | null> {
    const normalized = email.trim().toLowerCase();
    if (isSupabaseConfigured) {
      try {
        const rows = await supabaseRest(`igo_customers?email=eq.${encodeURIComponent(normalized)}&select=id,name,email,password_hash,created_at`, {
          method: 'GET'
        });
        if (Array.isArray(rows) && rows.length > 0 && rows[0].password_hash) {
          return {
            id: rows[0].id,
            name: rows[0].name,
            email: rows[0].email,
            passwordHash: rows[0].password_hash,
            createdAt: rows[0].created_at
          };
        }
        return null;
      } catch (err) {
        console.error('Supabase customer lookup failed, falling back to in-memory store:', (err as Error).message);
      }
    }
    return customersStore.get(normalized) || null;
  }

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        res.status(400).json({ error: 'A valid email address is required.' });
        return;
      }
      if (!password || typeof password !== 'string' || password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters.' });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existing = await findCustomerByEmail(normalizedEmail);
      if (existing) {
        res.status(409).json({ error: 'An account with this email already exists. Try logging in instead.' });
        return;
      }

      const id = `cust-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const passwordHash = hashPassword(password);
      const createdAt = new Date().toISOString();
      const customerName = (name && String(name).trim()) || normalizedEmail.split('@')[0];

      if (isSupabaseConfigured) {
        try {
          await supabaseRest('igo_customers', {
            method: 'POST',
            extraHeaders: { Prefer: 'return=minimal' },
            body: { id, name: customerName, email: normalizedEmail, password_hash: passwordHash }
          });
        } catch (err) {
          console.error('Supabase signup insert failed, falling back to in-memory store:', (err as Error).message);
          customersStore.set(normalizedEmail, { id, name: customerName, email: normalizedEmail, passwordHash, createdAt });
        }
      } else {
        customersStore.set(normalizedEmail, { id, name: customerName, email: normalizedEmail, passwordHash, createdAt });
      }

      res.json({ success: true, customer: { id, name: customerName, email: normalizedEmail } });
    } catch (err) {
      console.error('signup error:', err);
      res.status(500).json({ error: 'Failed to create account. Please try again.' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const customer = await findCustomerByEmail(email);
      if (!customer) {
        res.status(401).json({ success: false, error: 'No account found with this email. Create one first.' });
        return;
      }

      if (!verifyPassword(password, customer.passwordHash)) {
        res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
        return;
      }

      res.json({ success: true, customer: { id: customer.id, name: customer.name, email: customer.email } });
    } catch (err) {
      console.error('login error:', err);
      res.status(500).json({ error: 'Failed to sign in. Please try again.' });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        res.status(400).json({ error: 'A valid email address is required.' });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const customer = await findCustomerByEmail(normalizedEmail);
      if (!customer) {
        res.status(404).json({ error: 'No account found with this email.' });
        return;
      }

      const token = crypto.randomBytes(4).toString('hex').toUpperCase();
      passwordResetStore.set(normalizedEmail, { token, expiresAt: Date.now() + 15 * 60 * 1000 });

      // No email provider configured yet — same dev-fallback pattern as OTP,
      // so the reset flow stays fully testable in the meantime.
      console.log(`[DEV PASSWORD RESET] ${normalizedEmail}: ${token} (expires in 15 min)`);
      res.json({ success: true, channel: 'dev-fallback', devResetToken: token });
    } catch (err) {
      console.error('forgot-password error:', err);
      res.status(500).json({ error: 'Failed to start password reset. Please try again.' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;
      if (!email || !token || !newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        res.status(400).json({ error: 'Email, reset code, and a new password (6+ characters) are required.' });
        return;
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const entry = passwordResetStore.get(normalizedEmail);
      if (!entry) {
        res.status(400).json({ success: false, error: 'No reset request found for this email. Please request a new code.' });
        return;
      }
      if (Date.now() > entry.expiresAt) {
        passwordResetStore.delete(normalizedEmail);
        res.status(400).json({ success: false, error: 'Reset code expired. Please request a new one.' });
        return;
      }
      if (entry.token !== String(token).toUpperCase()) {
        res.status(400).json({ success: false, error: 'Incorrect reset code. Please try again.' });
        return;
      }

      const passwordHash = hashPassword(newPassword);
      if (isSupabaseConfigured) {
        try {
          await supabaseRest(`igo_customers?email=eq.${encodeURIComponent(normalizedEmail)}`, {
            method: 'PATCH',
            body: { password_hash: passwordHash }
          });
        } catch (err) {
          console.error('Supabase password reset update failed, falling back to in-memory store:', (err as Error).message);
          const existing = customersStore.get(normalizedEmail);
          if (existing) customersStore.set(normalizedEmail, { ...existing, passwordHash });
        }
      } else {
        const existing = customersStore.get(normalizedEmail);
        if (existing) customersStore.set(normalizedEmail, { ...existing, passwordHash });
      }

      passwordResetStore.delete(normalizedEmail);
      res.json({ success: true });
    } catch (err) {
      console.error('reset-password error:', err);
      res.status(500).json({ error: 'Failed to reset password. Please try again.' });
    }
  });

  // Orders API — mirrors every order into Supabase (durable system-of-record)
  // in the background. The client's localStorage copy remains the fast path
  // for the UI, so nothing breaks if Supabase is unreachable or the
  // `igo_orders` table hasn't been created yet (see
  // supabase/migrations/0002_igo_platform_schema.sql). Table is namespaced
  // "igo_" because this Supabase project is shared with another app —
  // never reuses or touches that app's tables.
  app.post('/api/orders', async (req, res) => {
    const order = req.body;
    console.log('Received order placement:', order?.id || order?.orderNumber);

    if (isSupabaseConfigured && order?.id) {
      try {
        await supabaseRest('igo_orders', {
          method: 'POST',
          extraHeaders: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: {
            id: order.id,
            order_number: order.orderNumber,
            created_at: order.createdAt,
            customer_name: order.customerName,
            customer_email: order.customerEmail,
            customer_phone: order.customerPhone,
            shipping_address: order.shippingAddress,
            items: order.items,
            subtotal: order.subtotal,
            discount_amount: order.discountAmount,
            delivery_fee: order.deliveryFee,
            tax: order.tax,
            total_amount: order.totalAmount,
            payment_method: order.paymentMethod,
            payment_status: order.paymentStatus,
            status: order.status,
            delivery_slot: order.deliverySlot,
            tracking_step: order.trackingStep,
            delivery_partner_name: order.deliveryPartnerName || null,
            driver_details: order.driverDetails || null
          }
        });
      } catch (err) {
        // Table may not exist yet, or credentials may be wrong — log and keep going.
        // The order already succeeded locally for the customer regardless.
        console.error('Supabase order sync failed (non-fatal):', (err as Error).message);
      }
    }

    res.json({ success: true, message: 'Order processed successfully', orderId: order?.id });
  });

  // Keeps an order's status/tracking/rider assignment in sync with Supabase.
  app.post('/api/orders/status', async (req, res) => {
    const { id, status, trackingStep, deliveryPartnerName } = req.body;
    if (!id) {
      res.status(400).json({ error: 'Order id required' });
      return;
    }

    if (isSupabaseConfigured) {
      try {
        const patch: Record<string, any> = {};
        if (status !== undefined) patch.status = status;
        if (trackingStep !== undefined) patch.tracking_step = trackingStep;
        if (deliveryPartnerName !== undefined) patch.delivery_partner_name = deliveryPartnerName;

        await supabaseRest(`igo_orders?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: patch
        });
      } catch (err) {
        console.error('Supabase order status sync failed (non-fatal):', (err as Error).message);
      }
    }

    res.json({ success: true });
  });

  // VITE OR STATIC SERVING
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Protein Cuts Server running at http://localhost:${PORT}`);
  });
}

startServer();
