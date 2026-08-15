// Owner: 명진 — rating guide. His accessibility-rating-guide (branch) replaces this at merge.
const ROWS = [
  ["Step", "0–1 cm", "1–2 cm", "over 2 cm"],
  ["Slope", "≤ 3.2° (1:18)", "≤ 4.8° (1:12)", "over 4.8°"],
  ["Clear width", "≥ 120 cm", "90–120 cm", "under 90 cm"],
  ["Door", "Automatic / always open", "Manual", "Revolving"],
  ["Accessible restroom", "1.6 × 2.0 m", "1.0 × 1.8 m (relaxed)", "None or under 0.9 m"],
];

export default function Guide() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">How we rate accessibility</h1>
      <p className="mt-3 text-ink">Each place is measured on site, item by item. The overall rating is the <strong>lowest</strong> grade among measured items. Items we could not measure are excluded — never guessed. If nothing was measured, the place shows <strong>○ Not surveyed</strong>.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-line bg-canvas text-xs">
            <th className="p-3">Item</th>
            <th className="p-3 text-verdict-green">● Accessible</th>
            <th className="p-3">▲ Caution needed</th>
            <th className="p-3 text-verdict-red">■ Difficult</th>
          </tr></thead>
          <tbody>{ROWS.map(r => (
            <tr key={r[0]} className="border-b border-line/50">
              <td className="p-3 font-bold">{r[0]}</td><td className="p-3">{r[1]}</td><td className="p-3">{r[2]}</td><td className="p-3">{r[3]}</td>
            </tr>))}
          </tbody>
        </table>
      </div>
      <section className="mt-8 rounded-xl border border-line bg-surface p-5 text-sm text-muted">
        <h2 className="font-bold text-ink">About this data</h2>
        <p className="mt-2">All figures were measured on site by our team (Aug 2026), with the survey date shown on each place. Conditions can change with construction, weather, and season. Barrier-Free (BF) certification badges are shown for reference only and are never used to compute our rating. Unmeasured items are left blank — we do not estimate.</p>
      </section>
    </div>
  );
}
