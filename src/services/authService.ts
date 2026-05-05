/**
 * Authentication Service
 * Handles real-time OTP delivery via email.
 */

export const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const sendEmailOTP = async (email: string, otp: string, userName: string) => {
  console.log(`Sending OTP ${otp} to ${email}...`);

  // This is a bridge to your real backend or a serverless function.
  // In a live Vercel environment, this would call /api/send-otp
  try {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, userName }),
    });

    if (!response.ok) {
      throw new Error('Failed to send OTP via server');
    }

    return { success: true };
  } catch (error) {
    console.error('Auth Service Error:', error);
    // If the API doesn't exist yet, we log it for the developer
    console.warn('Real OTP delivery requires the /api/send-otp endpoint to be deployed.');
    return { success: false, error };
  }
};
