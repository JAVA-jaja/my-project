import expirationMeme from '../assets/memes/expiration.jpg'
import longUrlMeme from '../assets/memes/long-url.png'
import statsResultMeme from '../assets/memes/stats-result.jpg'
import statsWaitingMeme from '../assets/memes/stats-waiting.jpg'

const memes = {
  expiration: { src: expirationMeme, alt: 'Expiration meme' },
  longUrl: { src: longUrlMeme, alt: 'Long URL meme' },
  statsResult: { src: statsResultMeme, alt: 'Click count result meme' },
  statsWaiting: { src: statsWaitingMeme, alt: 'Waiting for click count meme' },
}

export default function MemeImage({ variant }) {
  const meme = memes[variant]
  return <img className={`meme-image meme-image--${variant}`} src={meme.src} alt={meme.alt} />
}
