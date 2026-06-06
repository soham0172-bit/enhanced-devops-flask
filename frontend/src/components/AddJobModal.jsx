/**
 * AddJobModal.jsx
 *
 * Modal form that collects job data and POSTs to Flask /jobs.
 *
 * Props:
 *   open      boolean  — whether modal is visible
 *   onClose   fn       — called when user dismisses
 *   onCreated fn       — called after successful create (triggers refresh)
 */
import { useState } from 'react'
import { createJob } from '../api/api'

const STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected']

const EMPTY = {
  company: '',
  role: '',
  job_description: '',
  url: '',
  location: 'Remote',
  status: 'applied',
}

export default function AddJobModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  if (!open) return null

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await createJob(form)
      setForm(EMPTY)
      onCreated()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create job.')
    } finally {
      setSaving(false)
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-display tracking-wide text-text">Add job</h2>
          <button
            onClick={onClose}
            className="text-dim hover:text-text transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company *" value={form.company} onChange={set('company')} placeholder="Acme Corp" required />
            <Field label="Role *" value={form.role} onChange={set('role')} placeholder="Backend Intern" required />
          </div>

          <Field label="Job URL" value={form.url} onChange={set('url')} placeholder="https://..." type="url" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Location" value={form.location} onChange={set('location')} placeholder="Remote" />
            <div>
              <label className="block text-xs text-dim mb-1.5 tracking-wide">Status</label>
              <select
                value={form.status}
                onChange={set('status')}
                className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-text focus:outline-none focus:border-accent"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-dim mb-1.5 tracking-wide">
              Job description * <span className="text-muted">(paste the full JD — used for AI scoring)</span>
            </label>
            <textarea
              value={form.job_description}
              onChange={set('job_description')}
              required
              rows={5}
              placeholder="Paste the full job description here..."
              className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-text placeholder-muted focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {error && (
            <p className="text-red text-xs bg-red/5 border border-red/20 rounded px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-dim hover:text-text border border-border rounded hover:border-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs bg-accent text-black font-medium rounded hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Adding...' : 'Add job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Small reusable input field inside the modal
function Field({ label, value, onChange, placeholder, type = 'text', required }) {
  return (
    <div>
      <label className="block text-xs text-dim mb-1.5 tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-elevated border border-border rounded px-3 py-2 text-xs text-text placeholder-muted focus:outline-none focus:border-accent"
      />
    </div>
  )
}