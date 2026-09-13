const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Request failed. Please try again.')
  return data
}

export function createShortLink({ url, startDate, endDate }) {
  return request('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, startDate, endDate }),
  })
}

export function getLinkStats(shortUrl) {
  let parsed
  try { parsed = new URL(shortUrl) } catch { throw new Error('Enter a valid short URL.') }
  const code = parsed.pathname.match(/^\/([A-Za-z0-9]+)\/?$/)?.[1]
  if (!code) throw new Error('Enter a valid short URL.')
  return request(`/api/links/${encodeURIComponent(code)}`)
}
