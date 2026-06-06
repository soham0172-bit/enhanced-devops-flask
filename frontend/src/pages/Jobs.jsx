/**
 * pages/Jobs.jsx
 *
 * Full jobs table with:
 *  - Status filter tabs
 *  - Score button (opens ScoreModal)
 *  - Status update inline
 *  - Delete button
 */
import { useState } from 'react'
import { useJobs } from '../hooks/useJobs'
import StatusBadge from '../components/StatusBadge'
import ScoreBar from '../components/ScoreBar'
import AddJobModal from '../components/AddJobModal'
import ScoreModal from '../components/ScoreModal'
import { updateJob, deleteJob } from '../api/api'

const TABS = ['all', 'applied', 'interview', 'offer', 'rejected', 'saved']

export default function Jobs() {
  const [tab, setTab] = useState('all')
  const { jobs, loading, error, refresh } = useJobs(tab === 'all' ? null : tab)
  const [addOpen, setAddOpen] = useState(false)
  const [scoring, setScoring] = useState(null) // job object being scored

  async function handleStatusChange(job, newStatus) {
    await updateJob(job.id, { status: newStatus })
    refresh()
  }

  async function handleDelete(job) {
    if (!window.confirm(`Delete ${job.company} — ${job.role}?`)) return
    await deleteJob(job.id)
    refresh()
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-display text-text tracking-wide">Jobs</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="px-4 py-2 bg-accent text-black text-xs font-medium rounded hover:bg-accent/90 transition-colors"
        >
          + Add job
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-4 py-2 text-xs tracking-wide capitalize transition-colors -mb-px border-b',
              tab === t
                ? 'text-accent border-accent'
                : 'text-dim hover:text-text border-transparent',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red/5 border border-red/20 rounded text-red text-xs">{error}</div>
      )}

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-dim text-xs py-12 text-center">Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-dim text-xs py-12 text-center">No jobs found for this filter.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-dim border-b border-border">
                <th className="text-left pb-3 font-medium tracking-wide">Company</th>
                <th className="text-left pb-3 font-medium tracking-wide">Role</th>
                <th className="text-left pb-3 font-medium tracking-wide">Location</th>
                <th className="text-left pb-3 font-medium tracking-wide">Status</th>
                <th className="text-left pb-3 font-medium tracking-wide">AI score</th>
                <th className="text-left pb-3 font-medium tracking-wide">Added</th>
                <th className="text-left pb-3 font-medium tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-border/50 table-row-hover">
                  <td className="py-3 text-text font-medium">
                    {job.url ? (
                      <a href={job.url} target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">
                        {job.company}
                      </a>
                    ) : job.company}
                  </td>
                  <td className="py-3 text-dim">{job.role}</td>
                  <td className="py-3 text-muted">{job.location}</td>
                  <td className="py-3">
                    {/* Inline status dropdown */}
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job, e.target.value)}
                      className="bg-transparent text-xs border border-border rounded px-1.5 py-0.5 focus:outline-none focus:border-accent cursor-pointer"
                    >
                      {['applied','interview','offer','rejected','saved'].map((s) => (
                        <option key={s} value={s} className="bg-surface">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 w-36"><ScoreBar score={job.ai_score} /></td>
                  <td className="py-3 text-muted">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setScoring(job)}
                        className="text-dim hover:text-accent transition-colors text-xs border border-border rounded px-2 py-0.5 hover:border-accent"
                      >
                        score
                      </button>
                      <button
                        onClick={() => handleDelete(job)}
                        className="text-dim hover:text-red transition-colors text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddJobModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={refresh} />
      <ScoreModal job={scoring} onClose={() => setScoring(null)} onScored={refresh} />
    </div>
  )
}