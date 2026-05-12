import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { AlertTriangle, Radio, Diamond, ChevronUp, ChevronDown } from 'lucide-react'
import type { MissionReport as MissionReportType, MissionStatus } from '@/types/mission'
import { ICON_MAP, STATUS_DIVIDER, ALIGNMENT_LABELS } from './missionConstants'

interface Props { report: MissionReportType; status?: MissionStatus }

const ICON_MAP_TYPED = ICON_MAP as Record<string, keyof typeof LucideIcons>

function DiscoveryIcon({ icon }: { icon: string }) {
  const name = ICON_MAP_TYPED[icon.toLowerCase()]
  if (name) {
    const Icon = LucideIcons[name] as React.FC<{ size?: number; strokeWidth?: number; className?: string }>
    return <Icon size={14} strokeWidth={1.5} className="shrink-0 mt-0.5" />
  }
  return <Diamond size={14} strokeWidth={1.5} className="shrink-0 mt-0.5" />
}

const SQUAD_STATUS_COLOR: Record<string, string> = {
  'COMPLETATA':             'text-bc-green border-bc-green/40',
  'COMPLETATA CON DANNI':   'text-bc-amber border-bc-amber/40',
  'COMPLETATA CON PERDITE': 'text-[#f97316] border-[#f97316]/40',
  'CONTRATTO APERTO':       'text-bc-blue border-bc-blue/40',
  'FALLITA':                'text-bc-red border-bc-red/40',
}

const CHAR_COLOR: Record<string, string> = {
  ally:     'text-bc-green border-bc-green/30 bg-bc-green/5',
  contract: 'text-bc-amber border-bc-amber/30 bg-bc-amber/5',
  hostile:  'text-bc-red border-bc-red/30 bg-bc-red/5',
  neutral:  'text-bc-blue/70 border-bc-blue/20 bg-bc-blue/5',
}


function Section({ title, children, dividerClass }: { title: string; children: React.ReactNode; dividerClass: string }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`border-t ${dividerClass} pt-2`}>
      <button className="flex items-center justify-between w-full mb-2" onClick={() => setOpen(o => !o)}>
        <span className="flex items-center gap-1.5 font-mono text-xs tracking-widest text-bc-text/50 uppercase">
          <Diamond size={10} strokeWidth={1.5} />{title}
        </span>
        <span className="font-mono text-xs text-bc-text/40">{open ? <ChevronUp size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />}</span>
      </button>
      {open && children}
    </div>
  )
}

export function MissionReport({ report, status }: Props) {
  const d = status ? STATUS_DIVIDER[status] : 'border-bc-border/25'
  const sub = status ? STATUS_DIVIDER[status] : 'border-bc-border/30'
  return (
    <div className="mt-2 space-y-2">
      {report.date && (
        <p className="font-mono text-xs text-bc-muted tracking-wide">
          {[report.date, report.place].filter(Boolean).join(' · ')}
        </p>
      )}

      {report.intel && report.intel.length > 0 && (
        <Section title="Intel live" dividerClass={d}>
          <div className="flex flex-wrap gap-1.5">
            {report.intel.map((item, i) => (
              <div key={i} className={`flex items-start gap-1.5 w-full bg-bc-dark/60 border ${sub} rounded px-2.5 py-1.5`}>
                <Radio size={12} strokeWidth={1.5} className="text-bc-accent/50 shrink-0 mt-0.5" />
                <span className="font-sans text-xs text-bc-text/80 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {report.squads && report.squads.length > 0 && (
        <Section title="Squadre" dividerClass={d}>
          <div className="grid grid-cols-2 gap-1.5">
            {report.squads.map((sq) => (
              <div key={sq.number} className={`border ${sub} rounded p-2 bg-bc-dark/40`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-bc-muted">SQ.{sq.number}</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {(Array.isArray(sq.status) ? sq.status : [sq.status]).map((s, si) => (
                      <span key={si} className={`font-mono text-[10px] border px-1 py-0.5 rounded text-center ${SQUAD_STATUS_COLOR[s] ?? 'text-bc-muted border-bc-muted/20'}`}>
                        {s === 'COMPLETATA CON DANNI' ? <><span className="sm:hidden">COMPLETATA<br/>CON DANNI</span><span className="hidden sm:inline">COMPLETATA CON DANNI</span></> : s === 'COMPLETATA CON PERDITE' ? <><span className="sm:hidden">COMPLETATA<br/>CON PERDITE</span><span className="hidden sm:inline">COMPLETATA CON PERDITE</span></> : s}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="font-mono text-xs text-bc-text font-semibold leading-tight">{sq.name}</p>
                <p className="font-mono text-xs text-bc-muted mt-0.5">[{sq.location}] · {sq.type}</p>
                <p className="font-sans text-xs text-bc-text/70 mt-1 leading-snug">{sq.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {report.discoveries && report.discoveries.length > 0 && (
        <Section title="Scoperte principali" dividerClass={d}>
          <div className="space-y-1.5">
            {report.discoveries.map((d, i) => (
              <div key={i} className="flex items-start gap-2">
                <DiscoveryIcon icon={d.icon} />
                <div>
                  <p className="font-mono text-xs text-bc-text font-semibold">{d.title}</p>
                  <p className="font-sans text-xs text-bc-text/70 leading-snug mt-0.5">{d.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {report.characters && report.characters.length > 0 && (
        <Section title="Personaggi incontrati" dividerClass={d}>
          <div className="space-y-1.5">
            {report.characters.map((c, i) => (
              <div key={i} className={`border rounded p-2 ${CHAR_COLOR[c.alignment]}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono text-xs font-bold">{c.name}</span>
                  <span className="font-mono text-[10px] opacity-70">{ALIGNMENT_LABELS[c.alignment]}</span>
                </div>
                <p className="font-mono text-xs opacity-60">{c.role}</p>
                <p className="font-sans text-xs opacity-80 leading-snug mt-1">{c.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {report.contracts && report.contracts.length > 0 && (
        <Section title="Contratti aperti" dividerClass={d}>
          {report.contractsIncompatible && (
            <div className="flex items-center gap-1.5 mb-2 px-2 py-1 border border-bc-red/40 rounded bg-bc-red/5">
              <AlertTriangle size={12} strokeWidth={2} className="text-bc-red shrink-0" />
              <span className="font-mono text-xs text-bc-red tracking-wide">CONTRATTI INCOMPATIBILI — SCELTA OBBLIGATORIA</span>
            </div>
          )}
          <div className="space-y-2">
            {report.contracts.map((ct, i) => (
              <div key={i} className={`border ${sub} rounded p-2 bg-bc-dark/40`}>
                <p className="font-mono text-xs text-bc-text font-semibold mb-1">{ct.name}</p>
                <div className="space-y-0.5">
                  <p className="font-mono text-xs text-bc-muted">Cliente: <span className="text-bc-text/80">{ct.client}</span></p>
                  <p className="font-mono text-xs text-bc-muted">Obiettivo: <span className="text-bc-text/80">{ct.objective}</span></p>
                  <p className="font-mono text-xs text-bc-amber">Ricompensa: {ct.reward}</p>
                  <p className="font-sans text-xs text-bc-text/60 leading-snug mt-1 italic">{ct.consequence}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {report.assets && report.assets.length > 0 && (
        <Section title="Asset recuperati" dividerClass={d}>
          <div className="space-y-1">
            {report.assets.map((a, i) => (
              <div key={i} className={`flex items-center justify-between py-1 border-b ${sub} last:border-0`}>
                <span className="font-mono text-xs text-bc-text">{a.name}</span>
                <span className="font-mono text-xs text-bc-muted shrink-0 ml-2">{a.category}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {report.priorities && report.priorities.length > 0 && (
        <Section title="Priorità" dividerClass={d}>
          <ol className="space-y-1">
            {report.priorities.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-mono text-xs text-bc-accent/70 shrink-0 w-4 text-right">{i + 1}.</span>
                <span className="font-sans text-xs text-bc-text/90 leading-snug">{p}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  )
}
