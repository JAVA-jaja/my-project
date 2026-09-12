const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function hashText(value) {
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function validateHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateDateRange(startDate, endDate) {
  if (startDate && endDate && endDate < startDate) {
    return 'End date must be on or after start date.'
  }
  return ''
}

export function makeShortUrl(value) {
  let hash = hashText(value)
  let code = ''
  for (let index = 0; index < 6; index += 1) {
    code += ALPHANUMERIC[hash % ALPHANUMERIC.length]
    hash = Math.floor(hash / ALPHANUMERIC.length) ^ Math.imul(index + 1, 2654435761)
    hash >>>= 0
  }
  return `https://junoshort.com/${code}`
}

export function mockClickCount(value) {
  return hashText(value) % 100
}
