// Runs after "vite build". For every league page it writes dist/<slug>/index.html
// with the page's own title, description and heading, so search engines see
// the right text even before JavaScript runs.
// It never fails the build: if anything goes wrong it only prints a warning.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = 'https://derby-gamma.vercel.app'; // change when you buy your domain

try {
  const pages = JSON.parse(readFileSync('src/data/leaguePages.json', 'utf8'));
  const template = readFileSync(join('dist', 'index.html'), 'utf8');

  const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  const setAttr = (html, re, value) => html.replace(re, (_, a, b) => a + esc(value) + b);

  for (const p of pages) {
    const url = `${SITE_URL}/${p.slug}`;
    let html = template;

    html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(p.title)}</title>`);
    html = setAttr(html, /(name="description"\s+content=")[^"]*(")/, p.description);
    html = setAttr(html, /(<link rel="canonical" href=")[^"]*(")/, url);
    html = setAttr(html, /(property="og:url" content=")[^"]*(")/, url);
    html = setAttr(html, /(property="og:title" content=")[^"]*(")/, p.title);
    html = setAttr(html, /(property="og:description"\s+content=")[^"]*(")/, p.description);
    html = setAttr(html, /(name="twitter:title" content=")[^"]*(")/, p.title);
    html = setAttr(html, /(name="twitter:description"\s+content=")[^"]*(")/, p.description);
    html = html.replace(
      /(<div id="root">)[\s\S]*?(<\/div>)/,
      (_, a, b) => `${a}<h1>${esc(p.h1)}</h1><p>${esc(p.intro)}</p>${b}`
    );

    mkdirSync(join('dist', p.slug), { recursive: true });
    writeFileSync(join('dist', p.slug, 'index.html'), html);
  }
  console.log(`generate-league-pages: wrote ${pages.length} pages`);
} catch (err) {
  console.warn('generate-league-pages: skipped (', err && err.message, ')');
}
