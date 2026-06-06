/**
 * StatCard.jsx
 *
 * Displays a single number with a label and optional accent color.
 * Used on the Dashboard page for total / applied / interview / etc.
 *
 * Props:
 *   label     string  — e.g. "Total Jobs"
 *   value     number  — the big number shown
 *   accent    string  — tailwind text color class e.g. "text-green"
 *   sub       string  — optional small line below the number
 */
export default function StatCard({ label, value, accent = 'text-text', sub }) {
  return (
    <div className="card flex flex-col gap-3">
      <span className="text-dim text-xs tracking-widest uppercase">{label}</span>
      <span className={`text-3xl font-display font-medium tracking-tight ${accent}`}>
        {value ?? '—'}
      </span>
      {sub && <span className="text-dim text-xs">{sub}</span>}
    </div>
  )
}