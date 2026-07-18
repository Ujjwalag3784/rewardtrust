import glossary from '../data/reward-glossary.json';

// Lightweight keyword retrieval over the reward-concepts knowledge base.
export function retrieveGlossary(question, max = 3) {
  const q = (question || '').toLowerCase();
  const scored = glossary.map((g) => {
    let score = 0;
    for (const t of g.terms) if (q.includes(t.toLowerCase())) score += t.length;
    return { g, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map((x) => ({ id: x.g.id, text: x.g.text }));
}
export default retrieveGlossary;
