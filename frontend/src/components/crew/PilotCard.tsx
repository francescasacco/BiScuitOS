import type { Pilot } from '@/types/pilot'

interface PilotCardProps {
  pilot: Pilot
  onSelect?: (pilot: Pilot) => void
  selected?: boolean
}

export function PilotCard({ pilot, onSelect, selected }: PilotCardProps) {
  const isFemale = pilot.sesso === 'F'
  const borderSelected = isFemale ? 'border-bc-rose border-glow-rose' : 'border-bc-green border-glow'
  const borderIdle = isFemale
    ? 'border-bc-border hover:border-bc-rose/50 hover:bg-bc-rose/5'
    : 'border-bc-border hover:border-bc-green/50 hover:bg-bc-green/5'
  const nameColor = isFemale ? 'text-bc-rose text-glow-rose' : 'text-bc-green text-glow'
  const hasAntenna = pilot.mech_moduli?.toLowerCase().includes('antenna')
  return (
    <div
      className={`bc-panel border overflow-hidden cursor-pointer transition-all duration-150 ${
        selected ? borderSelected : borderIdle
      }`}
      onClick={() => onSelect?.(pilot)}
    >
      <div className={`px-4 py-3 border-b border-bc-border bg-gradient-to-r ${
        isFemale ? 'from-bc-rose/10' : 'from-bc-green/10'
      } to-transparent flex items-start justify-between`}>
        <div>
          <div className={`font-display text-base font-bold ${nameColor}`}>
            {pilot.identificativo}
          </div>
          <div className="font-mono text-bc-muted text-xs mt-0.5">
            CLASSE: {pilot.classe.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {pilot.role === 'operator' && (
            <span className="bc-tag text-xs border-bc-amber text-bc-amber animate-pulse">OPERATORE</span>
          )}
          {hasAntenna && (
            <span className="bc-tag text-xs border-bc-blue/40 text-bc-blue/60">MARCONISTA</span>
          )}
          <span className={`bc-tag text-xs ${
            isFemale ? 'border-bc-rose/40 text-bc-rose/60' : 'border-bc-green/40 text-bc-green/60'
          }`}>PILOTA</span>
        </div>
      </div>

      <div className="p-4">
      {pilot.mech_nome && (
        <div className="border-b border-bc-border pb-3 mb-2">
          <div className="font-mono text-bc-muted text-xs">UNITÀ MECH</div>
          <div className="font-mono text-xs text-bc-blue mt-1">{pilot.mech_nome}</div>
          {pilot.mech_telaio && (
            <div className="font-mono text-xs text-bc-muted mt-1">TELAIO: {pilot.mech_telaio}</div>
          )}
          {pilot.mech_status && (
            <div className="font-mono text-xs text-bc-amber mt-1 capitalize">
              STATO: {pilot.mech_status}
            </div>
          )}
        </div>
      )}

      <div className="mt-2 font-mono text-xs text-bc-muted">
        ID NODO: {pilot.id.slice(0, 8).toUpperCase()}
      </div>

      <p className="font-mono text-[10px] text-bc-amber uppercase tracking-[0.2em] text-center pt-1 border-t border-bc-amber/20 mt-4">
        TOCCA PER ULTERIORI DETTAGLI
      </p>
      </div>
    </div>
  )
}
