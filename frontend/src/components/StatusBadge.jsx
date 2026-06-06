/**
 * StatusBadge.jsx
 *
 * Renders a colored pill for a job's status field.
 * Each status has its own background + text combo so they're easy to scan.
 */
const STATUS_STYLES = {
  applied:   'bg-blue/10   text-blue   border border-blue/20',
  interview: 'bg-purple/10 text-purple border border-purple/20',
  offer:     'bg-green/10  text-green  border border-green/20',
  rejected:  'bg-red/10    text-red    border border-red/20',
  saved:     'bg-muted/30  text-dim    border border-muted/30',
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.saved
  return (
    <span className={`badge ${style}`}>
      {status}
    </span>
  )
}