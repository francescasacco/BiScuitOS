import { useOSStore } from '@/store/useOSStore'
import type { MissionStatus } from '@/types/mission'

const STATUS_STYLES: Record<MissionStatus, { color: string; glow: string }> = {
  active: { color: 'text-bc-green', glow: 'text-glow' },
  pending: { color: 'text-bc-amber', glow: '' },
  completed: { color: 'text-bc-muted', glow: '' },
  failed: { color: 'text-bc-red', glow: '' },
  classified: { color: 'text-bc-blue', glow: '' },
}

export function MissionFeed() {
  const { missions } = useOSStore()
  const active = missions.filter((m) => m.status === 'active').slice(0, 3)

  return (
    <div className="bc-panel border !border-bc-green/40 p-3">
      <div className="bc-section-header" style={{ borderBottomColor: 'color-mix(in srgb, var(--bc-green) 20%, transparent)' }}>NUCLEO MISSIONI — ATTIVE</div>
      {active.length === 0 ? (
        <p className="font-mono text-bc-muted text-xs">NESSUNA MISSIONE ATTIVA</p>
      ) : (
        <div className="space-y-3">
          {active.map((m) => {
            const s = STATUS_STYLES[m.status]
            return (
              <div key={m.id} className="border-b !border-bc-green/20 last:border-0 pb-3 last:pb-0">
                <div className={`font-mono text-sm font-bold ${s.color} ${s.glow}`}>
                  {m.title}
                </div>
                {m.summary && (
                  <div className="font-mono text-xs text-bc-muted mt-1">{m.summary}</div>
                )}
                {m.reward && (
                  <div className="font-mono text-xs text-bc-amber mt-1">
                    RICOMPENSA: {m.reward}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
