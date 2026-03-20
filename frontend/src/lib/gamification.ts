export interface Game {
  pts: number;
  scans: number;
  co2: number;
  badges: string[];
}

export const DEFAULT_GAME: Game = { pts: 0, scans: 0, co2: 0, badges: [] };

export interface Badge {
  id: string;
  icon: string;
  name: { en: string; hi: string; gu: string };
  desc: string;
  req: (g: Game) => boolean;
}

export const BADGES: Badge[] = [
  { id: "first", icon: "🌱", name: { en: "First Step", hi: "पहला कदम", gu: "પ્રથમ પગલું" }, desc: "Complete first scan", req: (g) => g.scans >= 1 },
  { id: "eco5", icon: "♻️", name: { en: "Eco Starter", hi: "इको स्टार्टर", gu: "ઇકો સ્ટાર્ટર" }, desc: "Scan 5 items", req: (g) => g.scans >= 5 },
  { id: "eco10", icon: "🌿", name: { en: "Green Warrior", hi: "हरित योद्धा", gu: "ગ્રીન વૉરિઅર" }, desc: "Scan 10 items", req: (g) => g.scans >= 10 },
  { id: "eco25", icon: "🏆", name: { en: "Eco Champion", hi: "इको चैंपियन", gu: "ઇકો ચેમ્પિયન" }, desc: "Scan 25 items", req: (g) => g.scans >= 25 },
  { id: "p100", icon: "⭐", name: { en: "Century", hi: "शतक", gu: "સદી" }, desc: "Earn 100 points", req: (g) => g.pts >= 100 },
  { id: "p250", icon: "🥇", name: { en: "Master Recycler", hi: "मास्टर रिसाइकलर", gu: "માસ્ટર રિસાઇક્લર" }, desc: "Earn 250 points", req: (g) => g.pts >= 250 },
];

export function awardPoints(game: Game): { game: Game; newBadges: string[] } {
  const updated: Game = {
    pts: game.pts + 10,
    scans: game.scans + 1,
    co2: game.co2 + 25,
    badges: [...game.badges],
  };

  const newBadges: string[] = [];
  for (const badge of BADGES) {
    if (!updated.badges.includes(badge.id) && badge.req(updated)) {
      updated.badges.push(badge.id);
      newBadges.push(badge.id);
    }
  }

  return { game: updated, newBadges };
}
