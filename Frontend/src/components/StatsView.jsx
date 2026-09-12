import { useState } from 'react'
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded'
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined'
import { mockClickCount } from '../lib/mockShortener'
import MemeImage from './MemeImage'

export default function StatsView() {
  const [url, setUrl] = useState('')
  const [count, setCount] = useState(null)
  const [message, setMessage] = useState('')

  async function pasteUrl() {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
      setMessage('Pasted from clipboard.')
    } catch {
      setMessage('Clipboard access is unavailable. Paste the URL manually.')
    }
  }

  function checkUrl(event) {
    event.preventDefault()
    if (!url.trim()) {
      setCount(null)
      setMessage('Enter a short URL to check.')
      return
    }

    setCount(mockClickCount(url.trim()))
    setMessage('Click count updated.')
  }

  return (
    <section className="view view--stats">
      <h1>
        <span>You can check</span>
        your short link click count right here!
      </h1>
      <form className="action-panel stats-panel" onSubmit={checkUrl}>
        <div className="url-row stats-url-row">
          <div className="input-with-action">
            <label className="sr-only" htmlFor="stats-url">Short URL to check</label>
            <input
              id="stats-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Paste your Short URL here...(e.g. https://junoshort.com/ABC123)"
            />
            <button className="mini-button" type="button" onClick={pasteUrl}>
              Paste <ContentPasteRoundedIcon aria-hidden="true" />
            </button>
          </div>
          <button className="primary-button check-button" type="submit">
            check <MouseOutlinedIcon aria-hidden="true" />
          </button>
        </div>
        <div className={`stats-output ${count === null ? 'stats-output--waiting' : ''}`}>
          {count !== null && (
            <div className="count-line">
              <output className="count-box" data-testid="click-count">{count}</output>
              <span>Times!</span>
            </div>
          )}
          <MemeImage variant={count === null ? 'statsWaiting' : 'statsResult'} />
        </div>
        <p className="form-message" aria-live="polite">{message}</p>
      </form>
    </section>
  )
}
