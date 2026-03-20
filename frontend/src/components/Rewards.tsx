import { Award, Leaf, Recycle, Sparkles } from 'lucide-react';
import { type Game, BADGES } from '../lib/gamification';
import { pick } from '../lib/utils';
import type { Lang } from '../lib/i18n';

interface RewardsProps {
  game: Game;
  lang: Lang;
  t: (key: string) => string;
}

export default function Rewards({ game, lang, t }: RewardsProps) {
  const stats = [
    { icon: <Sparkles className="w-5 h-5" />, label: t('pointsLabel'), value: game.pts, color: 'var(--accent)' },
    { icon: <Recycle className="w-5 h-5" />, label: t('scansLabel'), value: game.scans, color: '#60a5fa' },
    { icon: <Leaf className="w-5 h-5" />, label: t('co2Label'), value: `${game.co2}g`, color: '#34d399' },
    { icon: <Award className="w-5 h-5" />, label: t('badgesLabel'), value: game.badges.length, color: '#fbbf24' },
  ];

  return (
    <section id="rewards" className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="font-serif text-3xl md:text-4xl text-center mb-8" style={{ color: 'var(--text)' }}>
        {t('rewardsTitle')}
      </h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <div className="flex justify-center mb-2" style={{ color: s.color }}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {s.value}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="glass-card p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {BADGES.map(badge => {
            const earned = game.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className="text-center p-3 rounded-xl transition-all"
                style={{
                  background: earned ? 'var(--accent-bg)' : 'var(--bg3)',
                  border: `1px solid ${earned ? 'rgba(34,211,160,0.3)' : 'var(--border)'}`,
                  opacity: earned ? 1 : 0.4,
                }}
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <div className="text-xs font-semibold" style={{ color: earned ? 'var(--accent)' : 'var(--text3)' }}>
                  {pick(badge.name, lang)}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                  {badge.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
