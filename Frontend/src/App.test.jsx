import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  global.fetch = vi.fn(async (path, options) => {
    if (options?.method === 'POST') {
      return { ok: true, json: async () => ({ destinationUrl: 'https://example.com/long-path', shortUrl: 'https://junoshort.com/ABC123' }) }
    }
    if (path === '/api/links/ABC123') {
      return { ok: true, json: async () => ({ clickCount: 12 }) }
    }
    return { ok: false, json: async () => ({ error: 'short link not found' }) }
  })
})

describe('shortening flow', () => {
  it('switches real meme artwork with the active form state', async () => {
    const user = userEvent.setup()
    render(<App />)

    const defaultMeme = screen.getByRole('img', { name: /long url meme/i })
    expect(defaultMeme.tagName).toBe('IMG')

    await user.click(screen.getByRole('button', { name: /set expiration/i }))
    expect(screen.getByRole('img', { name: /expiration meme/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /check total press/i }))
    expect(screen.getByRole('img', { name: /waiting for click count meme/i })).toBeInTheDocument()

    await user.type(
      screen.getByLabelText(/short url to check/i),
      'https://junoshort.com/ABC123',
    )
    await user.click(screen.getByRole('button', { name: /^check$/i }))
    expect(await screen.findByRole('img', { name: /click count result meme/i })).toBeInTheDocument()
  })

  it('reveals expiration fields and rejects a malformed URL', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /shorten a link in one click/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /set expiration/i }))
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/url to shorten/i), 'not-a-url')
    await user.click(screen.getByRole('button', { name: /short url/i }))

    expect(
      screen.getByText(/enter a valid http or https url/i),
    ).toBeInTheDocument()
  })

  it('shows and copies a generated short URL, then restarts', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(
      screen.getByLabelText(/url to shorten/i),
      'https://example.com/long-path',
    )
    await user.click(screen.getByRole('button', { name: /short url/i }))

    expect(await screen.findByRole('heading', { name: /your short link is ready/i })).toBeInTheDocument()
    expect(
      screen.getByDisplayValue('https://example.com/long-path'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^copy$/i }))
    expect(screen.getByText(/copied/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /another one/i }))
    expect(
      screen.getByRole('heading', { name: /shorten a link/i }),
    ).toBeInTheDocument()
  })

  it('checks a short URL and returns a stable mock count', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /check total press/i }))
    expect(
      screen.getByRole('heading', { name: /click count right here/i }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('click-count')).not.toBeInTheDocument()

    await user.type(
      screen.getByLabelText(/short url to check/i),
      'https://junoshort.com/ABC123',
    )
    await user.click(screen.getByRole('button', { name: /^check$/i }))

    expect(await screen.findByTestId('click-count')).toHaveTextContent('12')
    expect(screen.getByText('Times!')).toBeInTheDocument()
  })
})
