import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      let v = l.slice(i + 1).trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      return [l.slice(0, i).trim(), v];
    })
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: reviews, error: e1 } = await supabase
  .from('product_reviews')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);
console.log('RECENT REVIEWS:', JSON.stringify(reviews, null, 2), e1?.message);

const { data: prod, error: e2 } = await supabase
  .from('products')
  .select('id, name')
  .ilike('name', '%testing%')
  .limit(5);
console.log('PRODUCT "testing":', JSON.stringify(prod, null, 2), e2?.message);
