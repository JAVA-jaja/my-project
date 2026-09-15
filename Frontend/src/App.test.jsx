import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  window.history.replaceState({}, '', '/')
  global.fetch = vi.fn(async (path, options) => {
    if (options?.method === 'POST') {
      return { ok: true, json: async () => ({ destinationUrl: 'https://example.com/long-path', shortCode: 'ABC12345', shortUrl: 'https://junoshort.com/ABC12345' }) }
    }
    if (path === '/api/links/ABC123') {
      return { ok: true, json: async () => ({ clickCount: 12 }) }
    }
    return { ok: false, json: async () => ({ error: 'short link not found' }) }
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('routing', () => {
  it('opens the click statistics page directly at /stats', () => {
    window.history.replaceState({}, '', '/stats')

    render(<App />)

    expect(
      screen.getByRole('heading', { name: /click count right here/i }),
    ).toBeInTheDocument()
  })

  it('updates the URL when navigating between the shortener and statistics', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('link', { name: /check total press/i }))
    expect(window.location.pathname).toBe('/stats')

    await user.click(screen.getByRole('link', { name: /juno short/i }))
    expect(window.location.pathname).toBe('/')
  })

  it('redirects an unknown route to the shortener', () => {
    window.history.replaceState({}, '', '/missing')

    render(<App />)

    expect(window.location.pathname).toBe('/')
    expect(
      screen.getByRole('heading', { name: /shorten a link in one click/i }),
    ).toBeInTheDocument()
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

    await user.click(screen.getByRole('link', { name: /check total press/i }))
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
    expect(screen.getByLabelText(/start time/i)).toHaveAttribute('type', 'time')
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end time/i)).toHaveAttribute('type', 'time')

    await user.type(screen.getByLabelText(/url to shorten/i), 'not-a-url')
    await user.click(screen.getByRole('button', { name: /short url/i }))

    expect(
      screen.getByText(/enter a valid http or https url/i),
    ).toBeInTheDocument()
  })

  it('defaults expiration times to the local time and preserves user changes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 14, 14, 37))
    render(<App />)

    const expirationButton = screen.getByRole('button', { name: /set expiration/i })
    fireEvent.click(expirationButton)

    expect(screen.getByLabelText(/start time/i)).toHaveValue('14:37')
    expect(screen.getByLabelText(/end time/i)).toHaveValue('14:37')

    fireEvent.change(screen.getByLabelText(/start time/i), { target: { value: '09:15' } })
    fireEvent.click(expirationButton)
    fireEvent.click(expirationButton)

    expect(screen.getByLabelText(/start time/i)).toHaveValue('09:15')
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
    expect(
      screen.getByDisplayValue(`${window.location.origin}/ABC12345`),
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

    await user.click(screen.getByRole('link', { name: /check total press/i }))
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

  it('keeps the statistics paste button usable when clipboard access is blocked', async () => {
    const user = userEvent.setup()
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
    render(<App />)

    await user.click(screen.getByRole('link', { name: /check total press/i }))
    await user.click(screen.getByRole('button', { name: /^paste/i }))

    expect(screen.getByLabelText(/short url to check/i)).toHaveFocus()
    expect(screen.getByText(/press ctrl\+v/i)).toBeInTheDocument()

    if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
    else delete navigator.clipboard
  })
})
