/**
 * Authentication Service
 * Handles real-time OTP delivery via email.
 */

export const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const sendEmailOTP = async (email: string, otp: string, userName: string) => {
  console.log(`Sending OTP ${otp} to ${email}...`);

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        to: email, 
        userName, 
        type: 'OTP',
        data: { otp } 
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Email API Error:', result);
      return { success: false, error: result.error || 'Failed to send OTP' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Auth Service Error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};


export const syncUserProfile = async (email: string, name: string, avatarUrl?: string) => {
  try {
    const { supabase } = await import('../lib/supabase');
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        email, 
        name,
        avatar_url: avatarUrl,
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (error) throw error;
    console.log('User profile synced to Supabase:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Supabase Sync Error:', error);
    return { success: false, error };
  }
};
