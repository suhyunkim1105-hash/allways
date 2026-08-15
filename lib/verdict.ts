// Verdict display mapping. DB values stay Korean; UI is English.
// Rule: icon + label + color ALWAYS together (never color alone).
export type VerdictKo = "초록" | "노랑" | "빨강" | "정보없음" | string;

export const VERDICT = {
  "초록":   { icon: "●", label: "Accessible",     text: "text-verdict-green",  chip: "bg-verdict-green/10 text-verdict-green" },
  "노랑":   { icon: "▲", label: "Caution needed", text: "text-ink",            chip: "bg-verdict-yellow/30 text-ink" },
  "빨강":   { icon: "■", label: "Difficult",      text: "text-verdict-red",    chip: "bg-verdict-red/10 text-verdict-red" },
  "정보없음": { icon: "○", label: "Not surveyed",  text: "text-verdict-none",   chip: "bg-verdict-none/10 text-verdict-none" },
} as const;

export const verdictOf = (v: VerdictKo) => VERDICT[(v as keyof typeof VERDICT)] ?? VERDICT["정보없음"];
export const verdictRank = (v: VerdictKo) => ({ "초록": 1, "노랑": 2, "빨강": 3 } as Record<string, number>)[v] ?? 4;
