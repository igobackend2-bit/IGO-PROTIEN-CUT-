export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, systemPrompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey.includes("MY_GEMINI")) {
    console.error("AI API Error: GEMINI_API_KEY is missing or invalid");
    return res.status(500).json({ 
      error: 'AI API Key not configured. Please add GEMINI_API_KEY to Vercel Environment Variables.' 
    });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `${systemPrompt}\n\nCustomer Question: ${message}` }] 
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help with your premium protein needs! What's cooking today?";
    return res.status(200).json({ text });
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    return res.status(500).json({ error: error.message || 'AI service error' });
  }
}
