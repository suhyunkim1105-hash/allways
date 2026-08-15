// Owner: 명진 (based on components/verdict-badge on the Myoungjin branch).
// Icon + label + color always together — never color alone.
import { verdictOf, VerdictKo } from "@/lib/verdict";

export default function VerdictBadge({ verdict, reason, size = "md" }:
  { verdict: VerdictKo; reason?: string | null; size?: "sm" | "md" | "lg" }) {
  const v = verdictOf(verdict);
  const pad = size === "lg" ? "px-4 py-2 text-lg" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span className="inline-flex items-center gap-2">
      <span role="img" aria-label={`${v.label}${reason ? `. ${reason}` : ""}`}
        className={`inline-flex items-center gap-1.5 rounded-full font-bold ${pad} ${v.chip}`}>
        <span aria-hidden="true">{v.icon}</span>{v.label}
      </span>
      {reason ? <span className="text-xs text-muted">{reason}</span> : null}
    </span>
  );
}
