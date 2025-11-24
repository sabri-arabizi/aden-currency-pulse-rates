export const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3000'

export async function fetchRates() {
  const res = await fetch(`${API_BASE}/api/rates`)
  if (!res.ok) throw new Error('Failed to fetch rates')
  return res.json()
}

export async function fetchGold() {
  const res = await fetch(`${API_BASE}/api/gold`)
  if (!res.ok) throw new Error('Failed to fetch gold prices')
  return res.json()
}
