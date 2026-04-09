/**
 * @param {{ value: number, max?: number, label?: string }} props
 */
export function ProgressBar({ value, max = 100, label }) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      {label != null && <span className="progress-bar__label">{label}</span>}
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
