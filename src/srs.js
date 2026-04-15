// SRS interval schedule in days (after graduating with streak >= 2)
export const INTERVALS = [1, 3, 7, 14, 30, 60]
export const ACTIVE_POOL_SIZE = 10
export const GRADUATE_STREAK = 2

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function daysBetween(dateStrA, dateStrB) {
  const a = new Date(dateStrA)
  const b = new Date(dateStrB)
  return Math.floor((b - a) / 86400000)
}

// Create a fresh progress entry for a card
export function freshProgress(cardId) {
  return {
    cardId,
    state: 'new',       // 'new' | 'learning' | 'known'
    streak: 0,
    intervalIdx: 0,     // index into INTERVALS array
    dueDate: todayStr(),
    lastSeen: null,
  }
}

// Determine if a known card is due today or overdue
export function isDue(prog) {
  if (prog.state !== 'known') return true
  return prog.dueDate <= todayStr()
}

// Apply a correct answer to a progress entry, returning updated entry
export function applyCorrect(prog) {
  const next = { ...prog, lastSeen: todayStr() }
  next.streak += 1

  if (next.state === 'known') {
    // Advance interval
    const nextIdx = Math.min(next.intervalIdx + 1, INTERVALS.length - 1)
    next.intervalIdx = nextIdx
    const days = INTERVALS[nextIdx]
    const due = new Date()
    due.setDate(due.getDate() + days)
    next.dueDate = due.toISOString().slice(0, 10)
  } else {
    // learning / new
    if (next.streak >= GRADUATE_STREAK) {
      next.state = 'known'
      next.intervalIdx = 0
      const due = new Date()
      due.setDate(due.getDate() + INTERVALS[0])
      next.dueDate = due.toISOString().slice(0, 10)
    } else {
      next.state = 'learning'
      next.dueDate = todayStr()
    }
  }

  return next
}

// Apply a wrong answer to a progress entry, returning updated entry
export function applyWrong(prog) {
  return {
    ...prog,
    streak: 0,
    state: prog.state === 'new' ? 'new' : 'learning',
    intervalIdx: 0,
    dueDate: todayStr(),
    lastSeen: todayStr(),
  }
}

// Given full progress map and all card ids, compute the active pool
// Active pool = up to ACTIVE_POOL_SIZE cards that are new/learning/due-known
export function computeActivePool(progressMap, allCardIds) {
  const today = todayStr()
  const active = []

  // First: all learning cards (seen but not graduated)
  for (const id of allCardIds) {
    const p = progressMap[id]
    if (p && p.state === 'learning') active.push(id)
    if (active.length >= ACTIVE_POOL_SIZE) break
  }

  // Second: due known cards
  for (const id of allCardIds) {
    if (active.length >= ACTIVE_POOL_SIZE) break
    const p = progressMap[id]
    if (p && p.state === 'known' && p.dueDate <= today) {
      if (!active.includes(id)) active.push(id)
    }
  }

  // Third: fill with new cards
  for (const id of allCardIds) {
    if (active.length >= ACTIVE_POOL_SIZE) break
    const p = progressMap[id]
    if (!p || p.state === 'new') {
      if (!active.includes(id)) active.push(id)
    }
  }

  return active
}

// Stats across all cards
export function computeStats(progressMap, allCardIds) {
  const today = todayStr()
  let newCount = 0, learningCount = 0, knownCount = 0, dueCount = 0

  for (const id of allCardIds) {
    const p = progressMap[id]
    if (!p || p.state === 'new') {
      newCount++
    } else if (p.state === 'learning') {
      learningCount++
    } else if (p.state === 'known') {
      knownCount++
      if (p.dueDate <= today) dueCount++
    }
  }

  return { newCount, learningCount, knownCount, dueCount, total: allCardIds.length }
}
