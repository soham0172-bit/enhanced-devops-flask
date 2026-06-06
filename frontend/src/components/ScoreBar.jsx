/**
 * ScoreBar.jsx
 *
 * Shows the AI fit score as a number + a thin progress bar.
 * Color shifts: red (< 40) → orange (40-69) → green (70+)
 */
export default function ScoreBar({ score }) {
  if (score == null) {
    return <span className="text-muted text-xs">not scored</span>
  }

  const color =
    score >= 70 ? 'bg-green'
    : score >= 40 ? 'bg-orange'
    : 'bg-red'

  const textColor =
    score >= 70 ? 'text-green'
    : score >= 40 ? 'text-orange'
    : 'text-red'

  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <span className={`text-xs font-display font-medium ${textColor} w-7 text-right`}>
        {score}
      </span>
      <div className="flex-1 h-1 bg-elevated rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}