# RewardTrust

RewardTrust is a React and Vite MVP for comparing Indian payment rewards before a user pays. It helps users enter a merchant and transaction amount, select the payment methods they own, and see a ranked recommendation with reward value, eligibility conditions, and a trust-oriented verification breakdown.

The product is based on the RewardTrust PRD: a neutral transparency layer for UPI and card rewards. RewardTrust is not a payment app, cashback provider, or sponsored ranking surface. Its goal is to make reward outcomes understandable before the transaction decision is made.

## Product Focus

RewardTrust addresses the anticipation gap in payment rewards: users often do not know whether a transaction will earn a reward, how much it will earn, or what conditions apply until after they have already paid.

The MVP focuses on:

- Merchant reward lookup for common Indian commerce categories.
- Amount-based reward calculation in rupee terms.
- Payment method comparison across selected cards and payment apps.
- Inline eligibility conditions, caps, and exclusions.
- Trust report views that surface confidence score, source type, verification chain, and freshness indicators.
- A mobile-first prototype suitable for validation and portfolio review.

## Current Scope

The current implementation is a frontend-only MVP using static JSON datasets.

Included:

- Merchant search and quick selection.
- Transaction amount entry with preset increments.
- Multi-select payment method profile.
- Ranked reward recommendations.
- Best option highlighting with alternative comparisons.
- Calculation breakdown and condition display.
- Trust report screen with confidence scoring and verification details.
- Basic history and profile mock views.

Not included:

- Real payment processing.
- Bank account or card account linking.
- Live reward-rate ingestion.
- Backend user accounts.
- Production analytics or error tracking.

## Technology Stack

- React 18
- Vite 4
- JavaScript modules
- Static JSON data files
- CSS-based mobile app prototype

## Project Structure

```text
rewardtrust/
  public/
    logos/                  Merchant logo assets
  src/
    components/             Reusable UI components
    data/                   Static MVP reward, merchant, and condition data
    utils/                  Reward calculation, ranking, and formatting helpers
    App.jsx                 Application state machine and screen composition
    index.css               Mobile-first application styling
    main.jsx                React entry point
  index.html
  package.json
  vite.config.js
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Reward Calculation Model

RewardTrust calculates a result for each selected payment method by:

1. Looking for merchant-specific reward rates.
2. Falling back to category-specific rates.
3. Falling back to general payment-method rates.
4. Applying minimum spend thresholds.
5. Applying premium rates where eligible.
6. Applying maximum caps when defined.
7. Attaching condition and verification metadata.
8. Ranking results by reward amount, then confidence score.

The calculation logic is implemented in `src/utils/calculateReward.js` and `src/utils/rankResults.js`.

## Data Model

The MVP uses static data files:

- `src/data/merchants.json`: supported merchants and categories.
- `src/data/payment-methods.json`: available cards and payment methods.
- `src/data/reward-rates.json`: rate entries, caps, confidence scores, source metadata, and verification chains.
- `src/data/conditions.json`: reusable plain-language eligibility rules and exclusions.

This structure is intentionally simple so the MVP can be validated without backend infrastructure. A production version should migrate reward rates and verification evidence to a managed database with freshness checks and source auditing.

## Product Principles

- Accuracy over inflated reward expectations.
- Plain-language conditions over legal fine print.
- Unbiased ranking based on reward outcome and confidence, not commercial placement.
- Fast time to first useful result.
- Clear trust signals whenever data quality or freshness affects a recommendation.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
