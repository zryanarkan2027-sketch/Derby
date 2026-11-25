import pagesJson from './leaguePages.json';
import type { LeagueFilter } from '@/data/matches';

export interface LeaguePage {
  id: LeagueFilter;
  slug: string;
  nameKu: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
}

export const LEAGUE_PAGES = pagesJson as unknown as LeaguePage[];

export function leaguePageById(id: LeagueFilter): LeaguePage | undefined {
  return LEAGUE_PAGES.find((p) => p.id === id);
}

export function leaguePageByPath(path: string): LeaguePage | undefined {
  const clean = path.replace(/\/+$/, '').replace(/^\//, '');
  return LEAGUE_PAGES.find((p) => p.slug === clean);
}

/** URL of a league's page ("/" for "all"; undefined when the league has no page). */
export function leaguePath(id: LeagueFilter): string | undefined {
  if (id === 'all') return '/';
  const page = leaguePageById(id);
  return page ? `/${page.slug}` : undefined;
}

let defaults: { title: string; description: string; canonical: string } | null = null;

function setMeta(selector: string, attr: string, value: string) {
  document.querySelector(selector)?.setAttribute(attr, value);
}

/** Updates the title, description and canonical link for a league page (or restores the home page ones). */
export function applyHead(page?: LeaguePage): void {
  if (typeof document === 'undefined') return;

  if (!defaults) {
    defaults = {
      title: document.title,
      description:
        document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    };
  }

  const title = page ? page.title : defaults.title;
  const description = page ? page.description : defaults.description;
  const url = page ? `${window.location.origin}/${page.slug}` : defaults.canonical;

  document.title = title;
  setMeta('meta[name="description"]', 'content', description);
  setMeta('link[rel="canonical"]', 'href', url);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
}
