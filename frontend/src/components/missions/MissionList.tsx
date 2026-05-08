import type { Mission, MissionStatus } from '@/types/mission'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { STATUS_COLORS, STATUS_LABELS } from './missionConstants'
import { MapPin, X } from 'lucide-react'

interface MissionListProps {
  missions: Mission[]
  selected: Mission | null
  onSelect: (m: Mission) => void
  isOperator: boolean
  repositioning: string | null
  onRepositionToggle: (id: string) => void
  onStatusChange: (id: string, status: MissionStatus) => void
}

export function MissionList({
  missions,
  selected,
  onSelect,
  isOperator,
  repositioning,
  onRepositionToggle,
  onStatusChange,
}: MissionListProps) {
  if (missions.length === 0) {
    return (
      <div className="bc-panel border border-bc-border p-6 text-center">
        <p className="font-mono text-bc-muted text-sm">NESSUNA MISSIONE NEL SISTEMA</p>
      </div>
    )
  }

  return (
    <>
      {missions.map(m => {
        const isSel = m.id === selected?.id
        return (
          <div
            key={m.id}
            className={`bc-panel border p-3 cursor-pointer transition-all duration-150 ${
              isSel ? 'border-bc-accent bg-bc-accent/5 border-glow' : 'border-bc-border hover:border-bc-border/80 hover:bg-bc-panel'
            }`}
            onClick={() => onSelect(m)}
          >
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className={`bc-tag ${STATUS_COLORS[m.status]} text-xs`}>
                {STATUS_LABELS[m.status]}
              </span>
              {m.map_x != null && (
                <span className="font-mono text-bc-muted/40 text-xs">📍</span>
              )}
            </div>
            <p className={`font-mono text-xs font-bold ${STATUS_COLORS[m.status].split(' ')[0]}`}>
              {m.title}
            </p>
            {m.summary && (
              <p className="font-mono text-xs text-bc-muted mt-1 line-clamp-2">{m.summary}</p>
            )}
            {m.reward && (
              <p className="font-mono text-xs text-bc-amber mt-1">↳ {m.reward}</p>
            )}
            {isOperator && (
              <div className="mt-2 space-y-2" onClick={e => e.stopPropagation()}>
                <CustomSelect
                  value={m.status}
                  onChange={(v) => onStatusChange(m.id, v as MissionStatus)}
                  options={['active', 'pending', 'completed', 'failed', 'classified']}
                  getLabel={(v) => STATUS_LABELS[v as MissionStatus]}
                />
                <button
                  className={`w-full font-mono text-xs px-2 py-1 border transition-all ${
                    repositioning === m.id
                      ? 'border-bc-green text-bc-green bg-bc-green/10'
                      : 'border-bc-muted/30 text-bc-muted hover:border-bc-green hover:text-bc-green'
                  }`}
                  onClick={() => onRepositionToggle(m.id)}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {repositioning === m.id
                      ? <><X size={11} strokeWidth={2.5} /> ANNULLA RIPOSIZIONAMENTO</>
                      : <><MapPin size={11} strokeWidth={2} /> AGGIORNA POSIZIONE</>}
                  </span>
                </button>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
