import { Recycle, Sun, Moon, RotateCcw } from 'lucide-react';
import type { Lang } from '../lib/i18n';
import type { Game } from '../lib/gamification';

interface HeaderProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  game: Game;
  serverOnline: boolean;
  onReset: () => void;
  t: (key: string) => string;
}

const sections = [
  { id: 'scanner', label: { en: 'Scanner', hi: 'स्कैनर', gu: 'સ્કેનર' } },
  { id: 'guide', label: { en: 'Guide', hi: 'मार्गदर्शिका', gu: 'માર્ગદર્શિકા' } },
  { id: 'rewards', label: { en: 'Rewards', hi: 'पुरस्कार', gu: 'પુરસ્કાર' } },
  { id: 'history', label: { en: 'History', hi: 'इतिहास', gu: 'ઇતિહાસ' } },
];

export default function Header({ lang, setLang, theme, setTheme, game, serverOnline, onReset, t }: HeaderProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Recycle className="w-6 h-6" style={{ color: 'var(--accent)' }} />
          <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>
            Neural<span style={{ color: 'var(--accent)' }}>Green</span>
          </span>
        </div>

        {/* Nav links - hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:text-[var(--accent)]"
              style={{ color: 'var(--text2)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              {s.label[lang]}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Server status */}
          <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: serverOnline ? '#22d3a0' : '#f87171' }}
            />
            <span style={{ color: 'var(--text3)' }}>
              {serverOnline ? t('serverReady') : t('serverOffline')}
            </span>
          </div>

          {/* Points */}
          <div className="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
            <span>⭐</span>
            <span className="font-semibold">{game.pts}</span>
          </div>

          {/* Language switcher */}
          <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--border2)' }}>
            {(['en', 'hi', 'gu'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-2 py-1 text-xs font-medium transition-all"
                style={{
                  background: lang === l ? 'var(--accent)' : 'transparent',
                  color: lang === l ? '#090d0f' : 'var(--text3)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {l === 'en' ? '🇬🇧 EN' : l === 'hi' ? '🇮🇳 HI' : '🏛️ GU'}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg transition-colors"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg transition-colors"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)', cursor: 'pointer' }}
            title="Reset Demo Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
