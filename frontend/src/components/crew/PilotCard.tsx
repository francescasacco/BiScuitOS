import type { Pilot } from '@/types/pilot'

interface PilotCardProps {
  pilot: Pilot
  onSelect?: (pilot: Pilot) => void
  selected?: boolean
}

export function PilotCard({ pilot, onSelect, selected }: PilotCardProps) {
  return (
    <div
      className={`bc-panel border p-4 cursor-pointer transition-all duration-150 ${
        selected
          ? 'border-bc-green border-glow'
          : 'border-bc-border hover:border-bc-green/50 hover:bg-bc-green/5'
      }`}
      onClick={() => onSelect?.(pilot)}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-sm font-bold text-bc-green text-glow">
            {pilot.identificativo}
          </div>
          <div className="font-mono text-bc-muted text-xs mt-0.5">
            CLASSE: {pilot.classe.toUpperCase()}
          </div>
        </div>
        <span className={`bc-tag text-xs ${
          pilot.role === 'operator'
            ? 'border-bc-amber text-bc-amber'
            : 'border-bc-green/40 text-bc-green/60'
        }`}>
          {pilot.role === 'operator' ? 'OPERATORE' : 'PILOTA'}
        </span>
      </div>

      {pilot.mech_nome && (
        <div className="mt-3 border-t border-bc-border pt-3">
          <div className="font-mono text-bc-muted text-xs">UNITÀ MECH</div>
          <div className="font-mono text-xs text-bc-blue mt-0.5">{pilot.mech_nome}</div>
          {pilot.mech_status && (
            <div className="font-mono text-xs text-bc-amber mt-0.5">
              STATO: {pilot.mech_status}
            </div>
          )}
        </div>
      )}

      <div className="mt-2 font-mono text-xs text-bc-muted">
        ID NODO: {pilot.id.slice(0, 8).toUpperCase()}
      </div>
    </div>
  )
}
