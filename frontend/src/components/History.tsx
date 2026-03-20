import { Clock, Trash2 } from 'lucide-react';
import type { HistoryEntry } from '../lib/utils';

interface HistoryProps {
  history: HistoryEntry[];
  t: (key: string) => string;
  onClear: () => void;
}

export default function History({ history, t, onClear }: HistoryProps) {
  return (
    <section id="history" className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-3xl md:text-4xl" style={{ color: 'var(--text)' }}>
          {t('historyTitle')}
        </h2>
        {history.length > 0 && (
          <button onClick={onClear} className="btn-ghost text-xs">
            <Trash2 className="w-3.5 h-3.5" />
            {t('clearHistory')}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text3)' }} />
          <p className="text-sm" style={{ color: 'var(--text3)' }}>
            {t('historyEmpty')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry, i) => (
            <div
              key={i}
              className="glass-card p-3 flex items-center gap-3 hover:scale-[1.01] transition-transform"
            >
              <span className="text-2xl w-10 text-center shrink-0">{entry.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>
                    {entry.label}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
                  >
                    {entry.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>
                    {entry.bin}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>
                    •
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>
                    {entry.timestamp}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                  {entry.confidence}%
                </div>
                <div className="text-xs" style={{ color: 'var(--text3)' }}>
                  +{entry.pts} pts
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
