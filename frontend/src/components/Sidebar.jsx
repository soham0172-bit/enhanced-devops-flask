/**
 * Sidebar.jsx — left navigation rail
 *
 * Uses NavLink from react-router-dom so the active route gets highlighted.
 */
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',          label: 'Dashboard', icon: GridIcon },
  { to: '/jobs',      label: 'Jobs',      icon: BriefcaseIcon },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-surface border-r border-border flex flex-col">
      {/* Logo / brand */}
      <div className="px-5 py-6 border-b border-border">
        <span className="text-accent font-display text-sm tracking-widest uppercase font-medium">
          JobTracker
        </span>
        <p className="text-dim text-xs mt-0.5 tracking-wide">devops dashboard</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2 rounded text-xs tracking-wide transition-colors',
                isActive
                  ? 'bg-elevated text-text border border-border'
                  : 'text-dim hover:text-text hover:bg-elevated',
              ].join(' ')
            }
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Backend status pill at the bottom */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-dim">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
          Flask API
        </div>
      </div>
    </aside>
  )
}

// ── Inline SVG icons (no icon library dependency) ────────────────────────────

function GridIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}

function BriefcaseIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="5" width="14" height="9" rx="1.5" />
      <path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5" />
    </svg>
  )
}
