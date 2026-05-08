import { useState } from 'react'
import type { Mission, MissionStatus } from '@/types/mission'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { STATUS_COLORS, STATUS_LABELS } from './missionConstants'
import { MapPin, X, FileText } from 'lucide-react'
import { MissionReport } from './MissionReport'

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
  const [reportOpen, setReportOpen] = useState<string | null>(null)

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
        const isReportOpen = reportOpen === m.id

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
              {hasReport && (
                <span className="font-mono text-bc-accent/50 text-[10px] tracking-wider">◈ RESOCONTO</span>
              )}
            </div>

            <p className={`font-mono text-xs font-bold ${STATUS_COLORS[m.status].split(' ')[0]}`}>
              {m.title}
            </p>

            {m.report?.theater && (
              <p className="font-mono text-[10px] text-bc-muted/50 mt-0.5">
                {[m.report.theater, m.report.date].filter(Boolean).join(' · ')}
              </p>
            )}

            {m.summary && (
              <p className="font-mono text-xs text-bc-muted mt-1 line-clamp-2">{m.summary}</p>
            )}
            {m.reward && (
              <p className="font-mono text-xs text-bc-amber mt-1">↳ {m.reward}</p>
            )}

            {hasReport && (
              <button
                className={`mt-2 w-full flex items-center justify-center gap-1.5 font-mono text-[10px] px-2 py-1 border rounded transition-all ${
                  isReportOpen
                    ? 'border-bc-accent/60 text-bc-accent bg-bc-accent/5'
                    : 'border-bc-border text-bc-muted/60 hover:border-bc-accent/40 hover:text-bc-accent/70'
                }`}
                onClick={(e) => { e.stopPropagation(); setReportOpen(isReportOpen ? null : m.id) }}
              >
                <FileText size={10} strokeWidth={2} />
                {isReportOpen ? 'CHIUDI RESOCONTO' : 'APRI RESOCONTO'}
              </button>
            )}

            {isReportOpen && m.report && (
              <div onClick={e => e.stopPropagation()}>
                <MissionReport report={m.report} />
              </div>
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
