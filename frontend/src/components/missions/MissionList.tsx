import type { Mission, MissionStatus } from '@/types/mission'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { STATUS_COLORS, STATUS_LABELS, STATUS_DOT, STATUS_BORDER_IDLE, STATUS_DIVIDER, STATUS_COLOR_VAR, STATUS_GLOW } from './missionConstants'
import { MapPin, X, AlertTriangle, Diamond, CornerDownRight } from 'lucide-react'

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
        const hasReport = !!m.report

        return (
          <div
            key={m.id}
            className={`rounded-xl border overflow-hidden cursor-pointer transition-all duration-150 ${
              isSel
                ? 'border-bc-accent bg-bc-accent/5 shadow-[0_0_12px_rgba(167,139,250,0.15)]'
                : STATUS_BORDER_IDLE[m.status]
            }`}
            style={{ '--mission-color': STATUS_COLOR_VAR[m.status] } as React.CSSProperties}
            onClick={() => onSelect(m)}
          >
          <div className={`px-3 py-2 bg-gradient-to-r ${STATUS_GLOW[m.status]} border-b ${STATUS_DIVIDER[m.status]} flex items-center justify-between gap-2`}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[m.status]}`} />
                <span className={`font-mono text-xs font-bold break-words ${STATUS_COLORS[m.status].split(' ')[0]}`}>
                  {m.title}
                </span>
              </div>
              <span className={`bc-tag text-[10px] shrink-0 ${STATUS_COLORS[m.status]}`}>
                {STATUS_LABELS[m.status]}
              </span>
            </div>

            <div className="px-3 py-3 space-y-2 bg-bc-dark/30">
              {m.report?.date && (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-bc-muted/70">
                    {[m.report.date, m.report.place].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}

              {m.summary && (
                <p className="font-sans text-sm text-bc-muted leading-relaxed line-clamp-2">{m.summary}</p>
              )}

              {m.reward && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <CornerDownRight size={11} strokeWidth={1.5} className="text-bc-muted/40 shrink-0" />
                  <span className="font-mono text-sm text-bc-amber">{m.reward}</span>
                </div>
              )}

              {hasReport && m.report?.discoveries && m.report.discoveries.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {m.report.discoveries.slice(0, 4).map((d, i) => (
                    <span key={i} className={`flex items-center gap-1 bg-bc-panel border ${STATUS_DIVIDER[m.status]} rounded-full px-2 py-0.5`}>
                      <Diamond size={11} strokeWidth={1.5} fill="currentColor" className="shrink-0" style={{ color: 'color-mix(in srgb, var(--mission-color) 70%, transparent)' }} />
                      <span className="font-sans text-[11px] text-bc-text/70 leading-none">{d.title}</span>
                    </span>
                  ))}
                  {m.report.discoveries.length > 4 && (
                    <span className="font-mono text-[11px] text-bc-muted/40 self-center">+{m.report.discoveries.length - 4}</span>
                  )}
                </div>
              )}

              {hasReport && m.report?.contractsIncompatible && (
                <div className="flex items-center justify-center gap-1.5 bg-bc-red/8 border border-bc-red/30 rounded px-2 py-1.5">
                  <AlertTriangle size={12} strokeWidth={2} className="text-bc-red shrink-0" />
                  <span className="font-mono text-xs text-bc-red tracking-wide">SCELTA CONTRATTO URGENTE</span>
                </div>
              )}
              {hasReport && (
                <p className="font-mono text-[10px] text-bc-amber uppercase tracking-[0.2em] text-center pt-1 border-t border-bc-amber/20 mt-1">
                  TOCCA PER ULTERIORI DETTAGLI
                </p>
              )}
            </div>

            {isOperator && (
              <div className={`border-t ${STATUS_DIVIDER[m.status]} px-3 py-2 space-y-2 bg-bc-dark/20`} onClick={e => e.stopPropagation()}>
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
