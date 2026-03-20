import { WASTE_DATA } from '../lib/wasteData';
import { WASTE_NAMES, type Lang } from '../lib/i18n';
import { pick } from '../lib/utils';

interface GuideProps {
  lang: Lang;
  t: (key: string) => string;
}

const GUIDE_ITEMS = [
  'cardboard', 'glass', 'metal', 'paper', 'plastic',
  'biological', 'battery', 'clothes', 'shoes', 'trash',
];

export default function Guide({ lang, t }: GuideProps) {
  return (
    <section id="guide" className="max-w-5xl mx-auto px-4 py-12">
      <h2 className="font-serif text-3xl md:text-4xl text-center mb-8" style={{ color: 'var(--text)' }}>
        {t('guideTitle')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {GUIDE_ITEMS.map(key => {
          const item = WASTE_DATA[key];
          if (!item) return null;
          const name = WASTE_NAMES[lang][key] || key;
          const bin = pick(item.bin_name, lang);
          const cat = pick(item.category, lang);

          return (
            <div
              key={key}
              className="glass-card p-4 space-y-2 hover:scale-[1.02] transition-transform cursor-default"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                    {name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text3)' }}>
                    {cat}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg3)' }}>
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ background: item.bin_color }}
                />
                <span className="text-xs font-medium" style={{ color: 'var(--text2)' }}>
                  {bin}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text3)' }}>
                {pick(item.tip, lang)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
