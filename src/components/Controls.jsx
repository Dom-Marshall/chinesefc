import { CARDS } from '../cards'
import DataTransfer from './DataTransfer'

const QUIZ_MODES = [
  { value: 'en-pin', label: 'EN → Pinyin' },
  { value: 'pin-en', label: 'Pinyin → EN' },
  { value: 'en-char', label: 'EN → Character' },
  { value: 'mixed', label: 'Mixed' },
]

const ALL_TAGS = ['all', ...Array.from(new Set(CARDS.map(c => c.tag))).sort()]

export default function Controls({ quizMode, activeTag, onQuizMode, onTag, onReset }) {
  return (
    <div className="controls">
      <div className="control-group">
        <label className="control-label">Mode</label>
        <div className="pill-group">
          {QUIZ_MODES.map(m => (
            <button
              key={m.value}
              className={`pill-btn ${quizMode === m.value ? 'active' : ''}`}
              onClick={() => onQuizMode(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label className="control-label">Topic</label>
        <div className="pill-group scrollable">
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              className={`pill-btn ${activeTag === tag ? 'active' : ''}`}
              onClick={() => onTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <DataTransfer />

      <div className="control-group reset-row">
        <button className="btn-reset" onClick={onReset}>
          Reset all progress
        </button>
      </div>
    </div>
  )
}
