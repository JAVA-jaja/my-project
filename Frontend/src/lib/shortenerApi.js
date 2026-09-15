const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Request failed. Please try again.')
  return data
}

function localTimestamp(date, time) {
  if (!date || !time) throw new Error('Select both start and end dates and times.')
  const timestamp = new Date(`${date}T${time}`)
  if (Number.isNaN(timestamp.getTime())) throw new Error('Enter a valid date and time.')
  return timestamp.toISOString()
}

export function createShortLink({ url, startDate, startTime, endDate, endTime }) {
  const body = { url }
  if (startDate || startTime || endDate || endTime) {
    body.startAt = localTimestamp(startDate, startTime)
    body.endAt = localTimestamp(endDate, endTime)
    if (body.endAt <= body.startAt) throw new Error('End date and time must be after start date and time.')
  }
  return request('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function getLinkStats(value) {
  const trimmed = value.trim()
  let code = /^[A-Za-z0-9]+$/.test(trimmed) ? trimmed : ''
  if (!code) {
    let parsed
    try { parsed = new URL(trimmed) } catch { throw new Error('Enter a valid short URL or code.') }
    code = parsed.pathname.match(/^\/([A-Za-z0-9]+)\/?$/)?.[1]
  }
  if (!code) throw new Error('Enter a valid short URL.')
  return request(`/api/links/${encodeURIComponent(code)}`)
}
