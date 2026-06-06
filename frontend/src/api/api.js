/**
 * lib/api.js — all Flask API calls live here.
 *
 * WHY THIS FILE EXISTS:
 * Instead of writing fetch() everywhere and repeating the base URL,
 * every component imports from here. If the backend URL ever changes,
 * you change it in ONE place.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Jobs ─────────────────────────────────────────────────────────────────────

export const fetchJobs = (status) =>
  api.get('/jobs', { params: status ? { status } : {} }).then((r) => r.data)

export const fetchJob = (id) => api.get(`/jobs/${id}`).then((r) => r.data)

export const createJob = (payload) => api.post('/jobs', payload).then((r) => r.data)

export const updateJob = (id, payload) =>
  api.patch(`/jobs/${id}`, payload).then((r) => r.data)

export const deleteJob = (id) => api.delete(`/jobs/${id}`).then((r) => r.data)

export const scoreJob = (id, resumeText) =>
  api.post(`/jobs/${id}/score`, { resume_text: resumeText }).then((r) => r.data)

export const fetchStats = () => api.get('/jobs/stats').then((r) => r.data)

export const fetchHealth = () => api.get('/health').then((r) => r.data)