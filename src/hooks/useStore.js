import { useState, useCallback } from 'react'
import { CARDS } from '../cards'
import {
  freshProgress, applyCorrect, applyWrong,
  computeActivePool, computeStats, todayStr
} from '../srs'

export const STORAGE_KEY = 'chinese-srs-v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

function defaultState() {
  return {
    progressMap: {},   // cardId -> progress object
    quizMode: 'en-pin',
    activeTag: 'all',
    sessionDate: todayStr(),
  }
}

export function useStore() {
  const [state, setStateRaw] = useState(() => loadState() || defaultState())

  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveState(next)
      return next
    })
  }, [])

  const allCardIds = CARDS
    .filter(c => state.activeTag === 'all' || c.tag === state.activeTag)
    .map(c => c.id)

  const activePool = computeActivePool(state.progressMap, allCardIds)
  const stats = computeStats(state.progressMap, CARDS.map(c => c.id))

  const answerCard = useCallback((cardId, correct) => {
    setState(prev => {
      const existing = prev.progressMap[cardId] || freshProgress(cardId)
      const updated = correct ? applyCorrect(existing) : applyWrong(existing)
      return {
        ...prev,
        progressMap: { ...prev.progressMap, [cardId]: updated }
      }
    })
  }, [setState])

  const setQuizMode = useCallback((mode) => {
    setState(prev => ({ ...prev, quizMode: mode }))
  }, [setState])

  const setActiveTag = useCallback((tag) => {
    setState(prev => ({ ...prev, activeTag: tag }))
  }, [setState])

  const resetProgress = useCallback(() => {
    setState(defaultState())
  }, [setState])

  const getProgress = useCallback((cardId) => {
    return state.progressMap[cardId] || freshProgress(cardId)
  }, [state.progressMap])

  return {
    state,
    allCardIds,
    activePool,
    stats,
    answerCard,
    setQuizMode,
    setActiveTag,
    resetProgress,
    getProgress,
  }
}
