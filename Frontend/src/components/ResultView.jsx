import { useRef, useState } from 'react'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import { copyText } from '../lib/clipboard'

export default function ResultView({ result, onRestart }) {
  const [message, setMessage] = useState('')
  const shortUrlInput = useRef(null)

  async function copyShortUrl() {
    const copied = await copyText(result.shortUrl, shortUrlInput.current)
    if (copied) {
      setMessage('Copied!')
    } else {
      setMessage('Could not copy. Select the short link and copy it manually.')
    }
  }

  return (
    <section className="view view--result">
      <h1>Your short link is ready!</h1>
      <div className="action-panel result-panel">
        <label className="result-field">
          <span>Your Link</span>
          <input value={result.originalUrl} readOnly />
        </label>
        <div className="result-field">
          <label htmlFor="short-link">Short Link</label>
          <span className="input-with-action result-input">
            <input id="short-link" ref={shortUrlInput} value={result.shortUrl} readOnly />
            <button className="mini-button" type="button" onClick={copyShortUrl}>
              Copy <ContentCopyRoundedIcon aria-hidden="true" />
            </button>
          </span>
        </div>
        <p className="form-message result-message" aria-live="polite">{message}</p>
        <button className="restart-button" type="button" onClick={onRestart}>
          Do you want another one?
        </button>
      </div>
    </section>
  )
}
