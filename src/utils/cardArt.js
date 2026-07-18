// Brand-ish card gradients + short labels + taglines, matching the design handoff.
export const CARD_ART = {
  sbi_cashback:         { grad: 'linear-gradient(135deg,#1b3a6b,#0d2040)', short: 'SBI',   tag: '5% online · 1% offline' },
  hdfc_swiggy:          { grad: 'linear-gradient(135deg,#4a1010,#200808)', short: 'HDFC',  tag: '10% Swiggy · 1% others' },
  amazon_pay_icici:     { grad: 'linear-gradient(135deg,#0d3535,#061f1f)', short: 'ICICI', tag: '5% Prime · 3% Amazon' },
  flipkart_axis:        { grad: 'linear-gradient(135deg,#12324f,#0a1c2e)', short: 'AXIS',  tag: '5% Flipkart · 4% partners' },
  axis_ace:             { grad: 'linear-gradient(135deg,#3a1f2e,#1f0d16)', short: 'AXIS',  tag: '4% food · 2% all spends' },
  hdfc_millennia:       { grad: 'linear-gradient(135deg,#1e2f3a,#0d171f)', short: 'HDFC',  tag: '5% partners · 1% others' },
  idfc_first_millennia: { grad: 'linear-gradient(135deg,#3a2a1b,#1f160d)', short: 'IDFC',  tag: '3X online reward points' },
  sbi_simplyclick:      { grad: 'linear-gradient(135deg,#1b2f3a,#0d171f)', short: 'SBI',   tag: '10X online partners' },
  kiwi:                 { grad: 'linear-gradient(135deg,#1E3A1E,#111E11)', short: 'KIWI',  tag: '1.5% UPI cashback' },
  cred:                 { grad: 'linear-gradient(135deg,#2D3748,#1A202C)', short: 'CRED',  tag: 'CRED coins on UPI' },
};

export function cardArt(id) {
  return CARD_ART[id] || { grad: 'linear-gradient(135deg,#1c1c22,#0f0f14)', short: 'CARD', tag: '' };
}
export default cardArt;
