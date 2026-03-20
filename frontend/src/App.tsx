import { useState, useEffect, useCallback } from 'react';
import type { Lang } from './lib/i18n';
import { UI_STRINGS, WASTE_NAMES } from './lib/i18n';
import { type Game, DEFAULT_GAME, awardPoints, BADGES } from './lib/gamification';
import { pick, loadFromStorage, saveToStorage, type HistoryEntry } from './lib/utils';
import type { WasteData } from './lib/wasteData';
import Header from './components/Header';
import Scanner from './components/Scanner';
import Guide from './components/Guide';
import Rewards from './components/Rewards';
import History from './components/History';

export default function App() {
  const [lang, setLang] = useState<Lang>(() => loadFromStorage<Lang>('ecoscan_lang', 'en'));
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadFromStorage<'dark' | 'light'>('ecoscan_theme', 'dark'));
  const [game, setGame] = useState<Game>(() => loadFromStorage<Game>('ecoscan_game', DEFAULT_GAME));
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadFromStorage<HistoryEntry[]>('ecoscan_history', []));
  const [serverOnline, setServerOnline] = useState(false);
  const [badgeToast, setBadgeToast] = useState<string | null>(null);

  // Translate helper
  const t = useCallback((key: string): string => {
    const strings = UI_STRINGS[lang] as Record<string, string>;
    return strings[key] || (UI_STRINGS.en as Record<string, string>)[key] || key;
  }, [lang]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveToStorage('ecoscan_theme', theme);
  }, [theme]);

  // Persist lang
  useEffect(() => {
    saveToStorage('ecoscan_lang', lang);
  }, [lang]);

  // Persist game
  useEffect(() => {
    saveToStorage('ecoscan_game', game);
  }, [game]);

  // Persist history
  useEffect(() => {
    saveToStorage('ecoscan_history', history);
  }, [history]);

  // Health check polling (proxied through Vite)
  useEffect(() => {
    const check = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch('/api/health', { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          setServerOnline(data.model_loaded === true);
        } else {
          setServerOnline(false);
        }
      } catch {
        setServerOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 12000);
    return () => clearInterval(interval);
  }, []);

  // Handle scan result
  const handleResult = useCallback((data: WasteData) => {
    // Award points
    const { game: newGame, newBadges } = awardPoints(game);
    setGame(newGame);

    // Show badge toast
    if (newBadges.length > 0) {
      const badge = BADGES.find(b => b.id === newBadges[0]);
      if (badge) {
        setBadgeToast(`${badge.icon} ${pick(badge.name, lang)} — ${t('badgeEarned')}`);
        setTimeout(() => setBadgeToast(null), 3000);
      }
    }

    // Add to history
    const entry: HistoryEntry = {
      icon: data.icon,
      label: WASTE_NAMES[lang][data.label] || data.label_display,
      category: pick(data.category, lang),
      confidence: data.confidence,
      bin: pick(data.bin_name, lang),
      timestamp: new Date().toLocaleString(),
      pts: 10,
    };
    setHistory(prev => [entry, ...prev].slice(0, 20));
  }, [game, lang, t]);

  const handleReset = () => {
    setGame(DEFAULT_GAME);
    setHistory([]);
    saveToStorage('ecoscan_game', DEFAULT_GAME);
    saveToStorage('ecoscan_history', []);
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveToStorage('ecoscan_history', []);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <div className="mesh-orb mesh-orb-1" />
      <div className="mesh-orb mesh-orb-2" />
      <div className="mesh-orb mesh-orb-3" />
      <div className="grid-overlay" />

      {/* Content */}
      <div className="relative z-10">
        <Header
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          game={game}
          serverOnline={serverOnline}
          onReset={handleReset}
          t={t}
        />

        <main className="pb-16">
          <Scanner lang={lang} t={t} onResult={handleResult} />
          <Guide lang={lang} t={t} />
          <Rewards game={game} lang={lang} t={t} />
          <History history={history} t={t} onClear={handleClearHistory} />
        </main>

        {/* Footer */}
        <footer className="text-center py-6" style={{ borderTop: '1px solid var(--border)', color: 'var(--text3)' }}>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span>♻️</span>
            <span>NeuralGreen — Smart Waste Identifier</span>
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
            PS-02 Hackathon Project
          </div>
        </footer>
      </div>

      {/* Badge toast */}
      {badgeToast && (
        <div
          className="fixed bottom-6 right-6 z-50 badge-toast px-5 py-3 rounded-xl shadow-2xl"
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            boxShadow: '0 8px 32px rgba(34,211,160,0.2)',
          }}
        >
          <div className="text-sm font-semibold">{badgeToast}</div>
        </div>
      )}
    </div>
  );
}
