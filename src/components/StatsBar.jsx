export default function StatsBar({ stats }) {
  const { newCount, learningCount, knownCount, dueCount, total } = stats
  const pct = total > 0 ? Math.round((knownCount / total) * 100) : 0

  return (
    <div className="stats-bar">
      <div className="stats-counts">
        <span className="stat new">{newCount} new</span>
        <span className="stat learning">{learningCount} learning</span>
        <span className="stat known">{knownCount} known</span>
        <span className="stat due">{dueCount} due</span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        <span className="progress-label">{pct}% known</span>
      </div>
    </div>
  )
}
