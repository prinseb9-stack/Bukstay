import { useEffect, useState } from 'react'
import '../styles/SplashScreen.css'

export default function SplashScreen({ onFinish }) {
  const [stage, setStage] = useState('drop') // drop -> wait -> slide -> type -> tagline -> done
  const [visibleLetters, setVisibleLetters] = useState(0)
  
  const restOfWord = ['u', 'k', 'S', 't', 'a', 'y']

  useEffect(() => {
    const dropTimer = setTimeout(() => {
      setStage('wait')
    }, 800)
    return () => clearTimeout(dropTimer)
  }, [])

  useEffect(() => {
    if (stage === 'wait') {
      const waitTimer = setTimeout(() => setStage('slide'), 2000)
      return () => clearTimeout(waitTimer)
    }

    if (stage === 'slide') {
      const slideTimer = setTimeout(() => setStage('type'), 600)
      return () => clearTimeout(slideTimer)
    }

    if (stage === 'type') {
      if (visibleLetters < restOfWord.length) {
        const typeTimer = setTimeout(() => {
          setVisibleLetters(prev => prev + 1)
        }, 150)
        return () => clearTimeout(typeTimer)
      } else {
        // All letters done, show tagline
        const taglineTimer = setTimeout(() => {
          setStage('tagline')
        }, 400)
        return () => clearTimeout(taglineTimer)
      }
    }

    if (stage === 'tagline') {
      // Show tagline for 1.5s then fade out
      const doneTimer = setTimeout(() => {
        setStage('done')
        setTimeout(onFinish, 500)
      }, 1500)
      return () => clearTimeout(doneTimer)
    }
  }, [stage, visibleLetters, onFinish])

  return (
    <div className={`splash-screen ${stage === 'done' ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-container">
          <span className={`letter letter-b ${stage}`}>B</span>
          {restOfWord.slice(0, visibleLetters).map((letter, i) => (
            <span key={i} className="letter letter-rest" style={{animationDelay: `${i * 0.1}s`}}>
              {letter}
            </span>
          ))}
        </div>
        <p className={`splash-tagline ${stage === 'tagline' || stage === 'done' ? 'show' : ''}`}>
          Discover Africa
        </p>
      </div>
    </div>
  )
}