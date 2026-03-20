export function pick(obj: Record<string, string> | string | undefined, lang: string): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return (obj as Record<string, string>)[lang] || obj['en'] || '';
}

export function pickArr(obj: Record<string, string[]> | string[] | undefined, lang: string): string[] {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  return (obj as Record<string, string[]>)[lang] || obj['en'] || [];
}

const langCodes: Record<string, string> = { en: 'en-US', hi: 'hi-IN', gu: 'gu-IN' };

export function speak(text: string, lang: string = 'en') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = langCodes[lang] || 'en-US';
  u.rate = 0.88;
  speechSynthesis.speak(u);
}

export interface HistoryEntry {
  icon: string;
  label: string;
  category: string;
  confidence: number;
  bin: string;
  timestamp: string;
  pts: number;
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

export function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
