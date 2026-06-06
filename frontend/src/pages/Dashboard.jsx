/**
 * pages/Dashboard.jsx
 *
 * The home page. Shows:
 *  - 5 stat cards (total, applied, interview, offer, avg AI score)
 *  - Table of the 5 most recently added jobs
 */
import { useState } from 'react'
import { useJobs } from '../hooks/useJobs'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import ScoreBar from '../components/ScoreBar'
import AddJobModal from '../components/AddJobModal'

export default function Dashboard() {
  const { jobs, stats, loading, error, refresh } = useJobs()
  const [addOpen, setAddOpen] = useState(false)

  const recent = jobs.slice(0, 5)

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-display text-text tracking-wide">Dashboard</h1>
          <p className="text-dim text-xs mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="px-4 py-2 bg-accent text-black text-xs font-medium rounded hover:bg-accent/90 transition-colors"
        >
          + Add job
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red/5 border border-red/20 rounded text-red text-xs">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total" value={stats?.total_jobs} />
        <StatCard label="Applied" value={stats?.by_status?.applied} accent="text-blue" />
        <StatCard label="Interview" value={stats?.by_status?.interview} accent="text-purple" />
        <StatCard label="Offers" value={stats?.by_status?.offer} accent="text-green" />
        <StatCard
          label="Avg AI score"
          value={stats?.average_ai_score ?? '—'}
          accent="text-accent"
          sub={`${stats?.scored_count ?? 0} scored`}
        />
      </div>

      {/* Recent jobs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs tracking-widest uppercase text-dim">Recent applications</h2>
        </div>

        {loading ? (
          <p className="text-dim text-xs py-8 text-center">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="text-dim text-xs py-8 text-center">
            No jobs yet — click "Add job" to start tracking.
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-dim border-b border-border">
                <th className="text-left pb-3 font-medium tracking-wide">Company</th>
                <th className="text-left pb-3 font-medium tracking-wide">Role</th>
                <th className="text-left pb-3 font-medium tracking-wide">Status</th>
                <th className="text-left pb-3 font-medium tracking-wide">AI score</th>
                <th className="text-left pb-3 font-medium tracking-wide">Added</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((job) => (
                <tr key={job.id} className="border-b border-border/50 table-row-hover">
                  <td className="py-3 text-text font-medium">{job.company}</td>
                  <td className="py-3 text-dim">{job.role}</td>
                  <td className="py-3"><StatusBadge status={job.status} /></td>
                  <td className="py-3 w-32"><ScoreBar score={job.ai_score} /></td>
                  <td className="py-3 text-muted">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddJobModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={refresh} />
    </div>
  )
}