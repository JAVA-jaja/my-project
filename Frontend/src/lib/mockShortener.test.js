import { describe, expect, it } from 'vitest'
import {
  makeShortUrl,
  mockClickCount,
  validateDateRange,
  validateHttpUrl,
} from './mockShortener'

describe('mock shortener domain', () => {
  it('rejects malformed and non-web URLs', () => {
    expect(validateHttpUrl('https://example.com/path')).toBe(true)
    expect(validateHttpUrl('http://example.com')).toBe(true)
    expect(validateHttpUrl('ftp://example.com')).toBe(false)
    expect(validateHttpUrl('hello')).toBe(false)
  })

  it('rejects an end date before the start date', () => {
    expect(validateDateRange('2026-09-12', '2026-09-11')).toBe(
      'End date must be on or after start date.',
    )
    expect(validateDateRange('2026-09-12', '2026-09-12')).toBe('')
  })

  it('creates stable, URL-safe short links', () => {
    expect(makeShortUrl('https://example.com/a')).toBe(
      makeShortUrl('https://example.com/a'),
    )
    expect(makeShortUrl('https://example.com/a')).toMatch(
      /^https:\/\/junoshort\.com\/[A-Za-z0-9]{6}$/,
    )
  })

  it('creates a stable click count in the expected range', () => {
    expect(mockClickCount('https://junoshort.com/ABC123')).toBe(
      mockClickCount('https://junoshort.com/ABC123'),
    )
    expect(mockClickCount('https://junoshort.com/ABC123')).toBeGreaterThanOrEqual(0)
    expect(mockClickCount('https://junoshort.com/ABC123')).toBeLessThanOrEqual(99)
  })
})
