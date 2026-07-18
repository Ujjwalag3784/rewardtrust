// RewardTrust — grounded reward assistant (Vercel serverless).
// The LLM ONLY narrates verified facts computed client-side by the deterministic
// engine, plus a curated reward glossary. It never invents reward numbers, and it
// only answers questions about card rewards/cashback. If no API key is configured,
// it returns 501 so the client falls back to the deterministic answer.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ = 25;
const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const rec = hits.get(ip) || { n: 0, t: now };
  if (now - rec.t > WINDOW_MS) { rec.n = 0; rec.t = now; }
  rec.n += 1;
  hits.set(ip, rec);
  return rec.n > MAX_REQ;
}

const SYSTEM = `You are RewardTrust's assistant. You ONLY help with Indian credit-card rewards, cashback, reward points, MCCs, caps, exclusions, and eligibility.

STRICT RULES:
- Answer using ONLY the "Verified facts" and "Glossary" provided in the user message. These are the single source of truth.
- NEVER state a reward amount, percentage, rate, or eligibility verdict that is not present in the Verified facts. If a specific number isn't provided, do not make one up — say it can't be confirmed.
- If the question is not about card rewards/cashback/points/MCC/eligibility, politely decline in one sentence and steer back to rewards.
- If neither the facts nor the glossary cover the question, say: "I can't verify that from official reward terms."
- Be concise (2–5 sentences), plain, and trustworthy. Do not use markdown headings.
- When facts include a source URL, you may mention it as the basis, but do not invent sources.`;

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve) => {
    let d = '';
    req.on('data', (c) => (d += c));
    req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch { resolve({}); } });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(501).json({ error: 'no_key' }); // client falls back

  const ip = (req.headers['x-forwarded-for'] || 'anon').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ error: 'rate_limited' });

  const { question, facts, glossary } = await readBody(req);
  if (!question || typeof question !== 'string') return res.status(400).json({ error: 'no_question' });

  const content =
    `Question: ${question}\n\n` +
    `Verified facts (the only source of truth for any number or verdict):\n${JSON.stringify(facts ?? null, null, 2)}\n\n` +
    `Glossary (reward concepts you may use for general explanation):\n${JSON.stringify(glossary ?? [], null, 2)}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
        max_tokens: 600,
        temperature: 0.2,
        system: SYSTEM,
        messages: [{ role: 'user', content }],
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(502).json({ error: 'upstream', detail: t.slice(0, 200) });
    }
    const data = await r.json();
    const answer = Array.isArray(data.content) ? data.content.map((c) => c.text || '').join('').trim() : '';
    return res.status(200).json({ answer });
  } catch (e) {
    return res.status(502).json({ error: 'fetch_failed', detail: String(e).slice(0, 200) });
  }
}
