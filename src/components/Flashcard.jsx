import { useState, useEffect } from 'react'

const STATE_LABELS = { new: 'new', learning: 'learning', known: 'known' }

function getPromptAndAnswer(card, quizMode) {
  // For mixed mode, randomly pick from the other modes
  const mode = quizMode === 'mixed'
    ? ['en-pin', 'pin-en', 'en-char'][Math.floor(Math.random() * 3)]
    : quizMode

  switch (mode) {
    case 'en-pin':
      return { prompt: card.en, answer: card.pin, answerChar: card.char, promptLabel: 'English', answerLabel: 'Pinyin' }
    case 'pin-en':
      return { prompt: card.pin, answer: card.en, answerChar: null, promptLabel: 'Pinyin', answerLabel: 'English' }
    case 'en-char':
      return { prompt: card.en, answer: card.char, answerChar: card.pin, promptLabel: 'English', answerLabel: 'Character' }
    default:
      return { prompt: card.en, answer: card.pin, answerChar: card.char, promptLabel: 'English', answerLabel: 'Pinyin' }
  }
}

export default function Flashcard({ card, progress, quizMode, onAnswer }) {
  const [revealed, setRevealed] = useState(false)
  const [qa, setQA] = useState(() => getPromptAndAnswer(card, quizMode))

  // Reset when card changes
  useEffect(() => {
    setRevealed(false)
    setQA(getPromptAndAnswer(card, quizMode))
  }, [card.id, quizMode])

  const handleReveal = () => setRevealed(true)

  const handleAnswer = (correct) => {
    onAnswer(card.id, correct)
  }

  const stateClass = progress.state

  return (
    <div className="flashcard-wrap">
      <div className="card-meta">
        <span className={`pill ${stateClass}`}>
          {STATE_LABELS[progress.state]}
          {progress.streak > 0 && <span className="streak"> ×{progress.streak}</span>}
        </span>
        <span className="tag-badge">{card.tag}</span>
      </div>

      <div className={`flashcard ${revealed ? 'revealed' : ''}`} onClick={!revealed ? handleReveal : undefined}>
        <div className="card-prompt-label">{qa.promptLabel}</div>
        <div className="card-prompt">{qa.prompt}</div>

        {!revealed && (
          <div className="tap-hint">tap to reveal</div>
        )}

        {revealed && (
          <div className="card-answer-wrap">
            <div className="card-answer-label">{qa.answerLabel}</div>
            <div className="card-answer">{qa.answer}</div>
            {qa.answerChar && (
              <div className="card-answer-secondary">{qa.answerChar}</div>
            )}
          </div>
        )}
      </div>

      {revealed && (
        <div className="answer-buttons">
          <button className="btn-wrong" onClick={() => handleAnswer(false)}>
            ✗ got it wrong
          </button>
          <button className="btn-right" onClick={() => handleAnswer(true)}>
            ✓ got it right
          </button>
        </div>
      )}
    </div>
  )
}
