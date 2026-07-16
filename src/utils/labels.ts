// Shared presentation-label helpers (used by App + screen components).
import type { Outcome, SourceTier } from '../types';

export const TIER_LABELS: Record<string, string> = {
  official: 'Official T&C',
  faq: 'Official FAQ',
  community: 'Community Reports',
  unverified: 'Unverified',
};

export const OUTCOME_LABEL: Record<Outcome, string> = {
  pending: 'PENDING',
  received: 'RECEIVED',
  not_received: 'NOT RECEIVED',
  partial: 'PARTIAL',
};

export function tierLabel(tier?: SourceTier | string): string {
  return (tier && TIER_LABELS[tier]) || 'Unknown';
}

export function formatVerified(iso?: string): string {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
