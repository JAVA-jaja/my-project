import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createShortLink, getLinkStats } from './shortenerApi'

beforeEach(() => {
  global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ shortCode: 'ABC123' }) }))
})

describe('shortener API', () => {
  it('converts local date and time fields to UTC timestamps', async () => {
    await createShortLink({
      url: 'https://example.com/long',
      startDate: '2026-09-14',
      startTime: '14:37',
      endDate: '2026-09-14',
      endTime: '15:37',
    })

    const [, options] = global.fetch.mock.calls[0]
    expect(JSON.parse(options.body)).toEqual({
      url: 'https://example.com/long',
      startAt: new Date('2026-09-14T14:37').toISOString(),
      endAt: new Date('2026-09-14T15:37').toISOString(),
    })
  })

  it('omits an inactive expiration window', async () => {
    await createShortLink({ url: 'https://example.com/long' })

    const [, options] = global.fetch.mock.calls[0]
    expect(JSON.parse(options.body)).toEqual({ url: 'https://example.com/long' })
  })

  it('accepts either a raw code or a short URL for statistics', async () => {
    await getLinkStats('ABC123')
    await getLinkStats('https://junoshort.com/XYZ789')

    expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/links/ABC123', undefined)
    expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/links/XYZ789', undefined)
  })
})
