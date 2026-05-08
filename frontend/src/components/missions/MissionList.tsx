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

const STATUS_GLOW: Record<MissionStatus, string> = {
  active:     'from-bc-green/10 to-transparent',
  pending:    'from-bc-amber/10 to-transparent',
  completed:  'from-cyan-400/8 to-transparent',
  failed:     'from-bc-red/10 to-transparent',
  classified: 'from-bc-blue/10 to-transparent',
}

const STATUS_DOT: Record<MissionStatus, string> = {
  active:     'bg-bc-green shadow-[0_0_5px_var(--bc-green)]',
  pending:    'bg-bc-amber shadow-[0_0_5px_var(--bc-amber)]',
  completed:  'bg-cyan-400',
  failed:     'bg-bc-red shadow-[0_0_5px_var(--bc-red)]',
  classified: 'bg-bc-blue shadow-[0_0_5px_var(--bc-blue)]',
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
                : 'border-bc-border hover:border-bc-border/80'
            }`}
            onClick={() => onSelect(m)}
          >
            {/* Colored header strip */}
            <div className={`px-3 py-2 bg-gradient-to-r ${STATUS_GLOW[m.status]} border-b border-bc-border/40 flex items-center justify-between gap-2`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[m.status]}`} />
                <span className={`font-mono text-xs font-bold truncate ${STATUS_COLORS[m.status].split(' ')[0]}`}>
                  {m.title}
                </span>
              </div>
              <span className={`bc-tag text-[10px] shrink-0 ${STATUS_COLORS[m.status]}`}>
                {STATUS_LABELS[m.status]}
              </span>
            </div>

            {/* Body */}
            <div className="px-3 py-3 space-y-2 bg-bc-dark/30">
              {m.report?.theater && (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-bc-muted/40 uppercase tracking-widest">Teatro</span>
                  <span className="font-mono text-xs text-bc-muted/70">
                    {[m.report.theater, m.report.date].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}

              {m.summary && (
                <p className="font-sans text-sm text-bc-muted leading-relaxed line-clamp-2">{m.summary}</p>
              )}

              {m.reward && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="font-mono text-xs text-bc-muted/40">↳</span>
                  <span className="font-mono text-sm text-bc-amber">{m.reward}</span>
                </div>
              )}

              {/* Intel pills */}
              {hasReport && m.report?.discoveries && m.report.discoveries.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {m.report.discoveries.slice(0, 3).map((d, i) => (
                    <span key={i} className="flex items-center gap-1 bg-bc-panel border border-bc-border/50 rounded-full px-2 py-0.5">
                      <span className="text-xs leading-none">{d.icon}</span>
                      <span className="font-sans text-[11px] text-bc-text/70 leading-none">{d.title}</span>
                    </span>
                  ))}
                  {m.report.discoveries.length > 3 && (
                    <span className="font-mono text-[11px] text-bc-muted/40 self-center">+{m.report.discoveries.length - 3}</span>
                  )}
                </div>
              )}

              {/* Contracts warning */}
              {hasReport && m.report?.contractsIncompatible && (
                <div className="flex items-center gap-1.5 bg-bc-red/8 border border-bc-red/30 rounded px-2 py-1.5">
                  <span className="text-bc-red text-sm">⚠</span>
                  <span className="font-mono text-xs text-bc-red tracking-wide">SCELTA CONTRATTO URGENTE</span>
                </div>
              )}
            </div>

            {/* Operator controls */}
            {isOperator && (
              <div className="border-t border-bc-border/30 px-3 py-2 space-y-2 bg-bc-dark/20" onClick={e => e.stopPropagation()}>
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
