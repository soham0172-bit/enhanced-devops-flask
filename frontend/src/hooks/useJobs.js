/**
 * hooks/useJobs.js
 *
 * Custom hook that components call to get jobs + stats data.
 * Keeps all loading/error state out of the components themselves.
 *
 * Usage: const { jobs, stats, loading, error, refresh } = useJobs()
 */
import { useState, useEffect, useCallback } from 'react'
import { fetchJobs, fetchStats } from '../api/api'

export function useJobs(statusFilter = null) {
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [jobsData, statsData] = await Promise.all([
        fetchJobs(statusFilter),
        fetchStats(),
      ])
      setJobs(jobsData.jobs || [])
      setStats(statsData)
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not reach the backend. Is Flask running?')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  return { jobs, stats, loading, error, refresh: load }
}