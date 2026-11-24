import { useEffect, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';

// Change this if you want a different public contact address.
const CONTACT_EMAIL = 'zryanarkan2027@gmail.com';
const UPDATED = '٢٢ی تشرینی دووەمی ٢٠٢٦';

export type InfoPageId = 'about' | 'privacy' | 'contact';

interface PageDef {
  title: string;
  description: string;
  body: ReactNode;
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mb-6">
    <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
    <div className="text-sm leading-7 text-slatey-300 space-y-2">{children}</div>
  </section>
);

const PAGES: Record<InfoPageId, PageDef> = {
  about: {
    title: 'دەربارەی Derby',
    description:
      'Derby ماڵپەڕێکی کوردییە بۆ ئەنجامی ڕاستەوخۆی یارییەکان، خشتەی خولەکان و پەخشی فەرمی.',
    body: (
      <>
        <Section title="Derby چییە؟">
          <p>
            Derby ماڵپەڕێکی کوردییە بۆ بینینی ئەنجامی ڕاستەوخۆی یارییەکانی تۆپی پێ، لەوانە
            پریمەرلیگ، لالیگا، بوندسلیگا، سێریا ئەی، لیگ ١ و خولی پاڵەوانانی ئەوروپا، لە یەک
            شوێندا و بە زمانی کوردی.
          </p>
        </Section>
        <Section title="ئامانجمان">
          <p>
            دەمانەوێت دۆستانی تۆپی پێ بە ئاسانی و خێرایی بزانن یارییەکان چۆن دەڕۆن، بێ ئەوەی
            پێویستیان بە گەڕان لە چەندین ماڵپەڕ هەبێت.
          </p>
        </Section>
        <Section title="دەربارەی پەخشەکان">
          <p>
            Derby هیچ پەخشێک خۆی هۆست ناکات. ئەو ڤیدیۆ و پەخشانەی لێرە دەبینرێن لە
            سەرچاوە فەرمییەکان (وەک YouTube) embed کراون، و مافی هەموو ناوەڕۆکەکان بۆ خاوەنە
            ڕەسەنەکانیانە.
          </p>
        </Section>
        <Section title="پەیوەندی">
          <p>
            بۆ هەر پرسیار یان پێشنیار، بڕوانە پەڕەی <a className="text-accent-400 underline" href="/contact">پەیوەندی</a>.
          </p>
        </Section>
      </>
    ),
  },
  privacy: {
    title: 'سیاسەتی تایبەتمەندی',
    description:
      'ئەم پەڕەیە ڕوون دەکاتەوە Derby چ زانیارییەک کۆدەکاتەوە، و چۆن بەکاریدەهێنێت.',
    body: (
      <>
        <p className="text-xs text-slatey-400 mb-4">دوایین نوێکردنەوە: {UPDATED}</p>
        <Section title="١. ئەو زانیارییانەی کۆدەکرێنەوە">
          <p>
            Derby پێویستی بە تۆمارکردن یان ئەکاونت نییە و ناو، ئیمەیڵ یان ژمارەی تەلەفۆنت
            داوا ناکات. تەنها ئامارێکی گشتی و ناناسراو کۆدەکرێتەوە، وەک ژمارەی سەردانکەران و
            ژمارەی کلیک لەسەر لینکەکان.
          </p>
        </Section>
        <Section title="٢. کووکیز و بیرگەی browser">
          <p>
            ماڵپەڕەکە بیرگەی browser (localStorage) بەکاردەهێنێت بۆ ئەوەی هەر بینەرێک ڕۆژانە
            تەنها یەکجار بژمێردرێت، بێ ئەوەی ناسنامەیەکی تایبەت یان زانیاری کەسی هەڵبگیرێت.
            لایەنە سێیەمەکانی وەک YouTube لەوانەیە کووکی خۆیان بەکاربهێنن.
          </p>
        </Section>
        <Section title="٣. ڕیکلام">
          <p>
            لە ئێستادا Derby ڕیکلامی لایەنی سێیەم نیشان نادات. ئەگەر لە داهاتوودا ڕیکلام
            زیاد بکرێت، ئەم پەڕەیە نوێ دەکرێتەوە.
          </p>
        </Section>
        <Section title="٤. ناوەڕۆکی لایەنی سێیەم">
          <p>
            پەخشەکان لە YouTube embed کراون، و پێشکەشکەرەکەی ڕەنگە داتای خۆی کۆبکاتەوە. هەروەها
            لینکەکانی ماڵپەڕی دەرەکی (affiliate) لەوانەیە بتبەن بۆ ماڵپەڕێک کە سیاسەتی
            تایبەتمەندی تایبەت بە خۆی هەیە و Derby بەرپرسیار نییە لێی.
          </p>
        </Section>
        <Section title="٥. منداڵان">
          <p>ئەم ماڵپەڕە ئامانجی مندالانی خوار ١٣ ساڵ نییە و بە ئەنقەست داتایان کۆناکاتەوە.</p>
        </Section>
        <Section title="٦. گۆڕانکاری">
          <p>ڕەنگە ئەم سیاسەتە جار جار نوێ بکرێتەوە. دوایین بەروار لە سەرەوەی پەڕەکە دەبینرێت.</p>
        </Section>
        <Section title="٧. پەیوەندی">
          <p>
            بۆ هەر پرسیارێک: <a className="text-accent-400 underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </Section>
      </>
    ),
  },
  contact: {
    title: 'پەیوەندی',
    description: 'پەیوەندی بە تیمی Derby بکە بۆ پرسیار، پێشنیار، یان ڕاپۆرتکردنی کێشە.',
    body: (
      <>
        <Section title="پەیوەندیمان پێوە بکە">
          <p>بۆ پرسیار، پێشنیار، ڕاپۆرتکردنی کێشە یان داواکاری ناوەڕۆک، ئیمەیڵمان بۆ بنێرە:</p>
          <p>
            <a
              className="inline-block mt-1 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium"
              href={`mailto:${CONTACT_EMAIL}`}
              dir="ltr"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>
        <Section title="داواکاری لابردنی ناوەڕۆک">
          <p>
            ئەگەر خاوەنی ناوەڕۆکێکیت و پێت وایە بەکارهێنانی لێرە ڕێگەپێدراو نییە، ئیمەیڵمان
            بۆ بنێرە و بەزووترین کات هەنگاو دەنێین.
          </p>
        </Section>
      </>
    ),
  },
};

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-white/5 bg-bg-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" aria-label="Derby">
            <Logo height={30} />
          </a>
          <nav className="flex items-center gap-4 text-xs text-slatey-400">
            <a href="/about" className="hover:text-white transition-colors">دەربارە</a>
            <a href="/privacy" className="hover:text-white transition-colors">تایبەتمەندی</a>
            <a href="/contact" className="hover:text-white transition-colors">پەیوەندی</a>
          </nav>
          <p className="text-xs text-slatey-500 text-center">
            © ٢٠٢٦ Derby — ئەنجامی ڕاستەوخۆ و پەخشی وەرزشی
          </p>
        </div>
        <p className="mt-4 text-[11px] text-slatey-500 text-center">
          Derby هیچ پەخشێک هۆست ناکات. ڤیدیۆکان لە سەرچاوە فەرمییەکان embed کراون.
        </p>
      </div>
    </footer>
  );
}

export default function InfoPage({ page }: { page: InfoPageId }) {
  const def = PAGES[page];

  useEffect(() => {
    document.title = `${def.title} | Derby`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', def.description);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', `${window.location.origin}/${page}`);
    window.scrollTo(0, 0);
  }, [def, page]);

  return (
    <div className="min-h-screen bg-bg-900 flex flex-col">
      <div className="bg-bg-800/95 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" aria-label="Derby">
            <Logo height={34} />
          </a>
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-slatey-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            سەرەکی
          </a>
        </div>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">{def.title}</h1>
        <div className="glass-card p-5 sm:p-8">{def.body}</div>
      </main>

      <SiteFooter />
    </div>
  );
}
