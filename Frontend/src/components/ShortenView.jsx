import { useState } from 'react'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded'
import { validateDateRange, validateHttpUrl } from '../lib/mockShortener'
import { createShortLink } from '../lib/shortenerApi'
import MemeImage from './MemeImage'

export default function ShortenView({ onShorten }) {
  const [url, setUrl] = useState('')
  const [expirationOpen, setExpirationOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function pasteUrl() {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
      setMessage('Pasted from clipboard.')
    } catch {
      setMessage('Clipboard access is unavailable. Paste the URL manually.')
    }
  }

  async function submit(event) {
    event.preventDefault()
    if (!validateHttpUrl(url.trim())) {
      setMessage('Enter a valid HTTP or HTTPS URL.')
      return
    }

    const dateError = expirationOpen ? validateDateRange(startDate, endDate) : ''
    if (dateError) {
      setMessage(dateError)
      return
    }

    setMessage('')
    setSubmitting(true)
    try {
      const link = await createShortLink({
        url: url.trim(),
        startDate: expirationOpen ? startDate : '',
        endDate: expirationOpen ? endDate : '',
      })
      onShorten({ originalUrl: link.destinationUrl, shortUrl: link.shortUrl })
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="view view--shorten">
      <h1>Shorten a link in one click!</h1>
      <form className="action-panel shorten-panel" onSubmit={submit} noValidate>
        <div className="url-row">
          <div className="input-with-action">
            <label className="sr-only" htmlFor="long-url">URL to shorten</label>
            <input
              id="long-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Paste your URL here...(e.g. https://junoshort.com)"
              aria-invalid={message.startsWith('Enter a valid') || undefined}
              aria-describedby="shorten-message"
            />
            <button className="mini-button" type="button" onClick={pasteUrl}>
              Paste <ContentPasteRoundedIcon aria-hidden="true" />
            </button>
          </div>
          <button className="primary-button" type="submit" disabled={submitting}>Short URL</button>
        </div>

        <div className={`options-row ${expirationOpen ? 'options-row--open' : ''}`}>
          <div className="option-block">
            <span className="option-label">Option</span>
            <button
              className={`expiration-button ${expirationOpen ? 'is-active' : ''}`}
              type="button"
              aria-expanded={expirationOpen}
              onClick={() => setExpirationOpen((open) => !open)}
            >
              <CalendarMonthOutlinedIcon className="calendar-icon" aria-hidden="true" />
              Set Expiration
            </button>
          </div>

          {expirationOpen && (
            <div className="date-fields">
              <label>
                <span>Start date</span>
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </label>
              <label>
                <span>End date</span>
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </label>
            </div>
          )}

          <MemeImage variant={expirationOpen ? 'expiration' : 'longUrl'} />
        </div>
        <p id="shorten-message" className="form-message" aria-live="polite">{message}</p>
      </form>
    </section>
  )
}
