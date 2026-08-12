import { GoogleGenAI } from '@google/genai';

/**
 * AI Search — Vercel Serverless Function.
 *
 * WHY THIS EXISTS
 * In development the site runs behind an Express server (`server.ts`), which
 * hosts /api/ai-search. Vercel does not run that Express process; it serves
 * the built static bundle and turns files in /api into serverless functions.
 * Without this file, /api/ai-search would 404 in production and the AI Search
 * modal would show "Failed to connect to AI server".
 *
 * The Gemini key is read from process.env on the server, so it never reaches
 * the browser bundle. Set GEMINI_API_KEY in the Vercel project's environment
 * variables — note NO `VITE_` prefix, which is what keeps it server-side.
 *
 * Behaviour matches server.ts exactly, including the rule-based fallback when
 * no key is configured, so dev and production respond the same way.
 */

interface VercelRequest {
  method?: string;
  body?: { query?: string };
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
}

/**
 * Rule-based fallback used when GEMINI_API_KEY isn't configured. Keyword
 * matching, not an AI response, and it says so — better than pretending an
 * unavailable model answered.
 */
function ruleBasedAnswer(query: string): string {
  const q = query.toLowerCase();

  const suggest = (
    name: string,
    category: string,
    reason: string,
    protein: string,
    quickRecipe: string
  ) => ({ name, category, reason, protein, quickRecipe });

  const recommendations = [];

  if (q.includes('protein') || q.includes('gym') || q.includes('muscle') || q.includes('fitness')) {
    recommendations.push(
      suggest(
        'Chicken Breast Boneless',
        'Chicken',
        'The highest protein-to-fat ratio in the catalog — the standard choice for muscle gain.',
        '31g per 100g',
        'Season with salt, pepper and paprika. Pan-sear 6 minutes a side, rest 5 minutes before slicing.'
      ),
      suggest(
        'Egg White Pack',
        'Eggs',
        'Almost pure protein with virtually no fat, and it absorbs any flavour you add.',
        '11g per 100g',
        'Whisk with black pepper and cook low and slow for a soft scramble.'
      )
    );
  } else if (q.includes('biryani') || q.includes('curry') || q.includes('gravy')) {
    recommendations.push(
      suggest(
        'Mutton Curry Cut',
        'Mutton',
        'Bone-in pieces release marrow as they cook, which is what gives a curry its depth.',
        '25g per 100g',
        'Brown the pieces first, then pressure cook 20 minutes with onion, tomato and whole spices.'
      ),
      suggest(
        'Chicken Curry Cut',
        'Chicken',
        'Cooks far faster than mutton while still giving you bone-in flavour.',
        '27g per 100g',
        'Marinate in yogurt and turmeric for 30 minutes, then simmer 25 minutes in your masala base.'
      )
    );
  } else if (q.includes('fish') || q.includes('seafood') || q.includes('omega')) {
    recommendations.push(
      suggest(
        'Salmon Fillet',
        'Fish',
        'The richest omega-3 source available, and it is very hard to overcook.',
        '25g per 100g',
        'Skin-side down in a hot pan for 4 minutes, flip for 2. Finish with lemon.'
      ),
      suggest(
        'Prawns',
        'Fish',
        'Ready in minutes and high in protein with very little fat.',
        '24g per 100g',
        'Toss in garlic butter over high heat for 3 minutes — any longer turns them rubbery.'
      )
    );
  } else if (q.includes('quick') || q.includes('fast') || q.includes('easy') || q.includes('15')) {
    recommendations.push(
      suggest(
        'Chicken Mince',
        'Chicken',
        'Cooks through in under 10 minutes and works in almost any dish.',
        '27g per 100g',
        'Stir-fry with ginger, garlic and soy. Serve over rice.'
      ),
      suggest(
        'Prawns',
        'Fish',
        'The fastest protein in the catalog — three minutes total.',
        '24g per 100g',
        'Garlic butter, high heat, 3 minutes. Done.'
      )
    );
  } else {
    recommendations.push(
      suggest(
        'Chicken Curry Cut',
        'Chicken',
        'The most versatile cut we sell, and consistently the bestseller.',
        '27g per 100g',
        'Marinate in yogurt and spices, then simmer 25 minutes.'
      ),
      suggest(
        'Mutton Curry Cut',
        'Mutton',
        'For when you want something richer than chicken.',
        '25g per 100g',
        'Pressure cook 20 minutes with whole spices.'
      )
    );
  }

  return JSON.stringify({ recommendations });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const query = req.body?.query;
  if (!query || typeof query !== 'string') {
    res.status(400).json({ error: 'Query string required' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Treat the placeholder from .env.example as "not configured" so a
  // half-finished setup falls back cleanly instead of erroring.
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are Protein Cuts IGO AI Sommelier & Meat Chef. The user asks: "${query}".
Suggest the top 2 recommended fresh meat or seafood cuts, estimated prep time, health benefits, protein density, and a quick 2-sentence recipe recommendation.
Format response as crisp structured JSON with keys:
"recommendations": [{"name": string, "category": string, "reason": string, "protein": string, "quickRecipe": string}]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.status(200).json({ resultText: response.text || '', source: 'gemini' });
      return;
    } catch (error) {
      // Fall through to the rule-based answer rather than failing the request —
      // a quota error or a transient outage shouldn't break search entirely.
      console.error('[ai-search] Gemini call failed, using fallback:', error);
    }
  }

  res.status(200).json({ resultText: ruleBasedAnswer(query), source: 'fallback' });
}
