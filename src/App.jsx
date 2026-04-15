import { useState, useMemo } from 'react'
import { CARDS } from './cards'
import { useStore } from './hooks/useStore'
import StatsBar from './components/StatsBar'
import Flashcard from './components/Flashcard'
import Controls from './components/Controls'
import { freshProgress } from './srs'

const cardMap = Object.fromEntries(CARDS.map(c => [c.id, c]))

export default function App() {
  const {
    state, allCardIds, activePool, stats,
    answerCard, setQuizMode, setActiveTag, resetProgress, getProgress
  } = useStore()

  const [showControls, setShowControls] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [queueIdx, setQueueIdx] = useState(0)

  // Build a shuffled quiz queue from the active pool
  const queue = useMemo(() => {
    const pool = [...activePool]
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool
  }, [activePool.join(',')])

  const currentCardId = queue[queueIdx % Math.max(queue.length, 1)]
  const currentCard = cardMap[currentCardId]

  const handleAnswer = (cardId, correct) => {
    answerCard(cardId, correct)
    setQueueIdx(i => i + 1)
  }

  const handleReset = () => {
    if (confirmReset) {
      resetProgress()
      setConfirmReset(false)
      setQueueIdx(0)
    } else {
      setConfirmReset(true)
    }
  }

  const handleResetCancel = () => setConfirmReset(false)

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="app-title-char">汉语</span>
          <span className="app-title-text">Chinese SRS</span>
        </div>
        <button
          className={`btn-settings ${showControls ? 'active' : ''}`}
          onClick={() => setShowControls(v => !v)}
          aria-label="Settings"
        >
          ⚙
        </button>
      </header>

      <StatsBar stats={stats} />

      {showControls && (
        <Controls
          quizMode={state.quizMode}
          activeTag={state.activeTag}
          onQuizMode={(m) => { setQuizMode(m); setQueueIdx(0) }}
          onTag={(t) => { setActiveTag(t); setQueueIdx(0) }}
          onReset={handleReset}
        />
      )}

      {confirmReset && (
        <div className="confirm-bar">
          <span>Reset all progress?</span>
          <button className="btn-confirm-yes" onClick={handleReset}>Yes, reset</button>
          <button className="btn-confirm-no" onClick={handleResetCancel}>Cancel</button>
        </div>
      )}

      <main className="main">
        {activePool.length === 0 ? (
          <div className="empty-state">
            <div className="empty-char">🎉</div>
            <p>All caught up! No cards due right now.</p>
            <p className="empty-sub">Check back tomorrow for your next review.</p>
          </div>
        ) : currentCard ? (
          <Flashcard
            key={`${currentCardId}-${queueIdx}`}
            card={currentCard}
            progress={getProgress(currentCardId)}
            quizMode={state.quizMode}
            onAnswer={handleAnswer}
          />
        ) : null}

        {activePool.length > 0 && (
          <div className="queue-info">
            Card {(queueIdx % activePool.length) + 1} of {activePool.length} active
          </div>
        )}
      </main>
    </div>
  )
}
