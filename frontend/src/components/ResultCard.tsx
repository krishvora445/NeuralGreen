import { useState } from 'react';
import { Volume2, Trash2, RotateCcw } from 'lucide-react';
import type { WasteData } from '../lib/wasteData';
import type { Lang } from '../lib/i18n';
import { WASTE_NAMES } from '../lib/i18n';
import { pick, pickArr, speak as speakFn } from '../lib/utils';

interface ResultCardProps {
  result: WasteData;
  lang: Lang;
  t: (key: string) => string;
  onScanAgain: () => void;
}

export default function ResultCard({ result, lang, t, onScanAgain }: ResultCardProps) {
  const [activeTab, setActiveTab] = useState<'desc' | 'dos' | 'impact'>('desc');

  const label = WASTE_NAMES[lang][result.label] || result.label_display;
  const categoryText = pick(result.category, lang);
  const binText = pick(result.bin_name, lang);
  const tipText = pick(result.tip, lang);
  const descText = pick(result.description, lang);
  const impactText = pick(result.impact, lang);
  const doList = pickArr(result.do, lang);
  const dontList = pickArr(result.dont, lang);

  const isBattery = result.label === 'battery';

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'var(--accent-bg)', border: '1px solid var(--border)' }}
          >
            {result.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              {label}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: isBattery ? 'rgba(248,113,113,0.15)' : 'var(--accent-bg)',
                  color: isBattery ? 'var(--danger)' : 'var(--accent)',
                  border: `1px solid ${isBattery ? 'rgba(248,113,113,0.3)' : 'rgba(34,211,160,0.2)'}`,
                }}
              >
                {categoryText}
              </span>
              <span className="text-xs" style={{ color: 'var(--text3)' }}>
                {result.confidence}% confidence
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => speakFn(pick(result.voice, lang), lang)}
          className="btn-ghost"
          style={{ fontSize: '0.75rem' }}
        >
          <Volume2 className="w-4 h-4" />
          {t('speak')}
        </button>
      </div>

      {/* Tip banner */}
      <div
        className="flex items-start gap-2 p-3 rounded-xl text-sm"
        style={{
          background: isBattery ? 'rgba(248,113,113,0.08)' : 'var(--accent-bg)',
          border: `1px solid ${isBattery ? 'rgba(248,113,113,0.2)' : 'rgba(34,211,160,0.15)'}`,
          color: isBattery ? 'var(--danger)' : 'var(--accent)',
        }}
      >
        <span className="text-lg shrink-0">{isBattery ? '⚠️' : '💡'}</span>
        <span>{tipText}</span>
      </div>

      {/* Disposal bin */}
      <div className="glass-card-inner p-3 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: result.bin_color + '22' }}
        >
          <Trash2 className="w-5 h-5" style={{ color: result.bin_color }} />
        </div>
        <div>
          <div className="text-xs" style={{ color: 'var(--text3)' }}>{t('disposalBin')}</div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{binText}</div>
        </div>
        <div
          className="ml-auto w-6 h-6 rounded-full"
          style={{ background: result.bin_color, border: '2px solid var(--border2)' }}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg3)' }}>
        {(['desc', 'dos', 'impact'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-btn flex-1 ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'desc' ? t('descTab') : tab === 'dos' ? t('dosTab') : t('impactTab')}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[120px]">
        {activeTab === 'desc' && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
            {descText}
          </p>
        )}

        {activeTab === 'dos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                {t('doLabel')}
              </div>
              {doList.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--danger)' }}>
                {t('dontLabel')}
              </div>
              {dontList.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text2)' }}>
                  <span style={{ color: 'var(--danger)' }}>✗</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--accent-bg)' }}>
            <span className="text-2xl">🌍</span>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
              {impactText}
            </p>
          </div>
        )}
      </div>

      {/* Top 3 Confidence */}
      <div className="space-y-2">
        <div className="text-xs font-semibold" style={{ color: 'var(--text3)' }}>
          {t('top3')}
        </div>
        {result.top3.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs w-24 truncate" style={{ color: 'var(--text2)' }}>
              {WASTE_NAMES[lang][item.label] || item.label}
            </span>
            <div className="confidence-bar flex-1">
              <div
                className="confidence-fill"
                style={{
                  width: `${item.confidence}%`,
                  background: i === 0 ? 'var(--accent)' : 'var(--text3)',
                }}
              />
            </div>
            <span className="text-xs w-10 text-right" style={{ color: 'var(--text3)' }}>
              {item.confidence}%
            </span>
          </div>
        ))}
      </div>

      {/* Scan Again */}
      <button onClick={onScanAgain} className="btn-accent w-full justify-center">
        <RotateCcw className="w-4 h-4" />
        {t('scanAgain')}
      </button>
    </div>
  );
}
