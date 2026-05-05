# Vercel Production Setup Guide

Follow these steps to enable the **Live AI Assistant** and **Real Email OTP** delivery.

## 1. Setting up Environment Variables
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select your **IGO Protein Cuts** project.
3. Navigate to **Settings** > **Environment Variables**.
4. Add the following keys:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `VITE_GEMINI_API_KEY` | `Your_Gemini_API_Key` | Power the AI Meat Assistant |
| `RESEND_API_KEY` | `re_123456789` | Send real OTP emails (Optional) |

---

## 2. Real OTP Delivery (Advanced)
To send real emails to your customers, you need a server-side function. I have prepared the code for a **Vercel Serverless Function** using [Resend](https://resend.com/).

### Create `api/send-otp.ts` in your project root:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  const { email, otp, userName } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'IGO Protein Cuts <onboarding@resend.dev>',
      to: [email],
      subject: 'Your IGO Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2D5A27;">Welcome to IGO Protein Cuts, ${userName}!</h2>
          <p>Your secure verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; color: #D4AF37; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
}
```

---

## 3. How the AI is Fixed
I have verified that the `AIAssistant.tsx` component is correctly configured to read `import.meta.env.VITE_GEMINI_API_KEY`. 
- **Demo Mode**: If the key is missing, it will use high-fidelity mock responses.
- **Live Mode**: Once you add the key to Vercel, it will automatically switch to using the **Gemini 1.5 Flash** model for real-time recipes and help.

## 4. Final Deployment
After adding the environment variables in Vercel:
1. Go to the **Deployments** tab.
2. Click the three dots on your latest deployment.
3. Select **Redeploy** to apply the new variables.
