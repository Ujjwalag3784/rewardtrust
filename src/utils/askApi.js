// Calls the grounded /api/ask backend. Throws on any failure so the caller
// can fall back to the deterministic answer (e.g. when no API key is configured).
export async function askApi({ question, facts, glossary }) {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question, facts, glossary }),
  });
  if (!res.ok) throw new Error('ask ' + res.status);
  const data = await res.json();
  if (!data.answer) throw new Error('empty');
  return data.answer;
}
export default askApi;
