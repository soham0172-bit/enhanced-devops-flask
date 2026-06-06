/**
 * ScoreModal.jsx
 *
 * Lets the user paste their resume and hit "Score" — calls POST /jobs/:id/score.
 * Shows strengths, gaps, and summary returned by Claude.
 *
 * Props:
 *   job       object   — the job being scored
 *   onClose   fn
 *   onScored  fn       — called after successful score (triggers refresh)
 */
import { useState } from 'react'
import { scoreJob } from '../api/api'

export default function ScoreModal({ job, onClose, onScored }) {
  const [resume, setResume] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!job) return null

  async function handleScore() {
    if (!resume.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await scoreJob(job.id, resume)
      setResult(data)
      onScored()
    } catch (err) {
      setError(err?.response?.data?.error || 'Scoring failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface">
          <div>
            <h2 className="text-sm font-display tracking-wide text-text">AI resume score</h2>
            <p className="text-xs text-dim mt-0.5">{job.company} — {job.role}</p>
          </div>
          <button onClick={onClose} className="text-dim hover:text-text text-lg leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Resume input */}
          {!result && (
            <>
              <div>
                <label className="block text-xs text-dim mb-1.5 tracking-wide">
                  Paste your resume text
                </label>
                <textarea
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  rows={10}
                  placeholder="Paste your full resume text here. The AI will compare it against the job description and give you a fit score..."
                  className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-text placeholder-muted focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {error && (
                <p className="text-red text-xs bg-red/5 border border-red/20 rounded px-3 py-2">{error}</p>
              )}

              <button
                onClick={handleScore}
                disabled={loading || !resume.trim()}
                className="w-full py-2.5 text-xs bg-accent text-black font-medium rounded hover:bg-accent/90 disabled:opacity-40 transition-colors"
              >
                {loading ? 'Scoring with Claude...' : 'Score my resume'}
              </button>
            </>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              {/* Big score */}
              <div className="flex items-center gap-4 p-4 bg-elevated rounded-lg border border-border">
                <span className={`text-5xl font-display font-medium ${
                  result.score >= 70 ? 'text-green' : result.score >= 40 ? 'text-orange' : 'text-red'
                }`}>
                  {result.score}
                </span>
                <div>
                  <p className="text-xs text-dim tracking-wide">fit score</p>
                  <p className="text-xs text-text mt-1 leading-relaxed max-w-sm">{result.summary}</p>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <p className="text-xs text-dim tracking-widest uppercase mb-2">Strengths</p>
                <ul className="space-y-1">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text">
                      <span className="text-green mt-0.5">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div>
                <p className="text-xs text-dim tracking-widest uppercase mb-2">Gaps</p>
                <ul className="space-y-1">
                  {result.gaps?.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text">
                      <span className="text-red mt-0.5">✗</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs border border-border rounded hover:border-muted text-dim hover:text-text transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}