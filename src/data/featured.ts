// The featured channels shown at the top of the home page.
// To add one more channel later, add one more line to FEATURED_SLOTS:
// the home page and the admin panel pick it up automatically.
// (Keep the first id as it is: it keeps the old view counter.)

export interface FeaturedSlot {
  id: string;
  /** Shown as the title until you type a channel name in the admin panel */
  fallbackTitle: string;
}

export const FEATURED_SLOTS: FeaturedSlot[] = [
  { id: '__BEIN_NEWS__', fallbackTitle: 'پەخشی ڕاستەوخۆ' },
  { id: '__FEATURED_2__', fallbackTitle: 'پەخشی ڕاستەوخۆ' },
  { id: '__FEATURED_3__', fallbackTitle: 'پەخشی ڕاستەوخۆ' })،
];

export function isFeaturedId(id: string): boolean {
  return FEATURED_SLOTS.some((s) => s.id === id);
}

/** Older rows have an automatic name like "لینکی ١": that is not a real channel name. */
export function cleanChannelName(name?: string | null): string {
  const n = (name || '').trim();
  return /^لینکی\s*[\d٠-٩]+$/.test(n) ? '' : n;
}
