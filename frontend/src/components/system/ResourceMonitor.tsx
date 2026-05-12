import { useOSStore } from '@/store/useOSStore'

function ResourceBar({ label, value, max, color }: {
  label: string
  value: number
  max: number
  color: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div>
      <div className="flex justify-between font-mono text-xs mb-1">
        <span className="text-bc-muted">{label}</span>
        <span style={{ color }}>{value} / {max}</span>
      </div>
      <div className="h-2 bg-bc-track rounded-sm overflow-hidden">
        <div
          className="h-full transition-all duration-700 rounded-sm"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
    </div>
  )
}

export function ResourceMonitor() {
  const { crawlerSystem } = useOSStore()
  const sys = crawlerSystem

  return (
    <div className="bc-panel border border-bc-border p-3">
      <div className="bc-section-header">MONITOR RISORSE</div>
      <div className="space-y-4">
        <ResourceBar label="CARBURANTE" value={sys?.fuel ?? 0} max={100} color="var(--bc-green)" />
        <div className="flex justify-between font-mono text-xs">
          <span className="text-bc-muted">ROTTAMI</span>
          <span className="text-bc-amber font-bold">{sys?.scrap ?? '—'}</span>
        </div>
        <div className="flex justify-between font-mono text-xs pt-2 border-t border-bc-border">
          <span className="text-bc-muted">INGEGNERI ATTIVI</span>
          <span className="text-bc-blue font-bold">{sys?.engineers ?? 0}</span>
        </div>
      </div>
    </div>
  )
}
