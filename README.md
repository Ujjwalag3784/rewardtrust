# RewardTrust

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-75_passing-16A34A?style=for-the-badge)
![Hallucination](https://img.shields.io/badge/Hallucination-structurally_impossible-7C3AED?style=for-the-badge)

**The Trust Layer for Indian payment rewards.** RewardTrust answers one question — *"If I pay this merchant with one of my cards, exactly what reward will I get, and why?"* — and backs **every** answer with an official source, an MCC-based eligibility decision, a computed confidence score, and a last-verified date. When something can't be verified, it says so instead of guessing.

> Trust is the product. Whenever there's a trade-off between being helpful and being correct, RewardTrust chooses correct.

---

## What makes it different

Most reward apps are comparison tables that quietly assume you'll earn the headline rate. RewardTrust models the thing that actually decides rewards in India — the **Merchant Category Code (MCC)** — and refuses to promise a number it can't verify.

The canonical example, reproduced faithfully by the engine and its tests: paying **Amazon** with the **HDFC Swiggy** card returns **PARTIAL — "MCC 5262 (Marketplaces) is excluded from the 5% online tier, so it earns the 1% base rate"**, while the same Amazon payment on **SBI Cashback** returns **ELIGIBLE 5%**. Same merchant, opposite outcome, each explained and cited.

---

## Core capabilities

- **Personal card wallet** — mobile-number sign-in (demo OTP, client-side) and a saved wallet of the cards you own. Every lookup runs against *your* wallet.
- **Two ways to check a payment** — scan a UPI QR, or search a merchant and enter an amount.
- **Grouped, explained results** — cards split into **✓ Will earn** (ranked by value), **✕ Won't earn** (exact reason), and **? Can't confirm** (MCC unknown — never a fabricated number).
- **Explainable MCC-first engine** — verdict (`eligible | partial | ineligible | unknown`) + plain-language reason + the official quote, source URL, and last-verified date behind it.
- **Reward valuation** — cashback, Amazon Pay balance, and **points shown with an estimated ₹ value** (labelled *estimated*).
- **AI Reward Intelligence layer (deterministic)** — an "Ask RewardTrust" assistant for natural-language lookups, a *"why didn't I get cashback?"* diagnostic, and receipt/QR understanding — with **no language model in the number-producing path**, so hallucination is structurally impossible.
- **Post-payment verification loop** — log whether a reward actually posted; confirmed outcomes feed back into the confidence score.
- **UPI QR camera scanner** — reads the merchant category (`mc`) straight from the QR when present, per the NPCI deep-link spec.

---

## The AI layer, and why it's *not* a chatbot

The reward decision is **100% deterministic** — the verified rule engine is the single source of truth and the only thing allowed to produce a number, verdict, or citation. AI is confined to the fuzzy edges:

```
User text / QR / receipt
        │
   NLU (deterministic)      ← classifies intent, extracts {merchant, amount, card, mcc}
        │  structured, never prose numbers
   VERIFIED ENGINE (tools)  ← the only source of truth: evaluateEligibility, lookup, diagnose
        │  result + official source + confidence
   Explainer                ← narrates the engine's output; every figure copied from it
```

Guardrails: the assistant never emits a number it didn't get from the engine; displayed confidence is capped at `min(inputConfidence, ruleConfidence)`; unresolved inputs trigger a **clarifying question**, not a guess; unknown MCC renders *"This could not be verified from official sources."*

Receipts are OCR'd client-side (Tesseract.js) to *seed* a lookup (amount, merchant, card hint) for you to confirm — never to decide eligibility, because receipts don't carry the MCC.

---

## Supported cards (10, official-sourced)

Amazon Pay ICICI · SBI Cashback · Swiggy HDFC · Kiwi (RuPay-on-UPI) · CRED · Flipkart Axis · Axis ACE · HDFC Millennia · IDFC FIRST Millennia · SBI SimplyCLICK.

Every reward rule carries its own `source { url, title, quote, lastUpdated }`. Anything not verifiable from official documentation is marked in-app rather than asserted.

---

## Architecture

```
src/
  data/                     Verified, sourced datasets (the source of truth)
    card-programs.json        10 cards → ordered rules (rate, cap, MCC matchers, per-rule source)
    merchants.json            merchant registry (name, MCC, MCC-confidence, VPA patterns)
    mcc-catalog.json          MCC → label / friendly category
    payment-methods.json    
## AI assistant backend (grounded, optional)

The "Ask RewardTrust" tab runs on a grounded architecture where **the language model never produces a reward number** — it only narrates verified facts computed by the deterministic engine, plus a curated reward glossary. Hallucination stays structurally impossible.

- **Endpoint:** `api/ask.js` (Vercel serverless). It refuses off-topic questions (rewards-only scope), answers strictly from the verified facts + glossary it's given, rate-limits per IP, and caps output tokens.
- **Fallback:** if no API key is set (or the call fails / is rate-limited), the assistant automatically falls back to the deterministic answer. So the app works **for free** until a key is added, and costs only when someone actually chats.

### Enable the LLM answers

Set these environment variables in your Vercel project (Settings → Environment Variables):

| Variable | Required | Default | Notes |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | yes | — | Your Anthropic key. Never committed; the browser never sees it. |
| `ANTHROPIC_MODEL` | no | `claude-3-5-haiku-latest` | Override with the exact model string you want (e.g. a Haiku model for low cost). |

Redeploy after adding the key. Locally, `vercel dev` runs the function; a plain `npm run dev` (Vite only) will use the deterministic fallback since `/api` isn't served.

> The knowledge base is `src/data/reward-glossary.json` (reward concepts) plus the verified `card-programs.json` rules. Editing those updates answers instantly — no model retraining.
