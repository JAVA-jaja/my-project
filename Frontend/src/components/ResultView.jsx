import { useState } from 'react'

export default function ResultView({ result, onRestart }) {
  const [message, setMessage] = useState('')

  async function copyShortUrl() {
    try {
      await navigator.clipboard.writeText(result.shortUrl)
      setMessage('Copied!')
    } catch {
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
        <label className="result-field">
          <span>Short Link</span>
          <span className="input-with-action result-input">
            <input value={result.shortUrl} readOnly />
            <button className="mini-button" type="button" onClick={copyShortUrl}>
              Copy <span aria-hidden="true">▣</span>
            </button>
          </span>
        </label>
        <p className="form-message result-message" aria-live="polite">{message}</p>
        <button className="restart-button" type="button" onClick={onRestart}>
          Do you want another one?
        </button>
      </div>
    </section>
  )
}
