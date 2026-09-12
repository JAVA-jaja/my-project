import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('shortening flow', () => {
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

    expect(
      screen.getByRole('heading', { name: /your short link is ready/i }),
    ).toBeInTheDocument()
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
})
