import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOSStore } from '@/store/useOSStore'
import { Diamond, CornerDownRight, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react'
import type { MissionStatus } from '@/types/mission'
import type { JournalEntry, JournalEntryType } from '@/types/journal'
import type { CrawlerSection, HangarItem } from '@/types/system'

const DEFAULT_SECTIONS: CrawlerSection[] = [
  { name: 'Ponte Comando',       detail: 'Princeps: Ottaviano',               status: 'active'  },
  { name: 'Ponte Mech',          detail: 'Capo Meccanico: Maurice',           status: 'active'  },
  { name: 'Officina Meccanica',  detail: "Ing. Spec.: Bob l'aggiustatutto",   status: 'active'  },
  { name: 'Cabine Piloti Lv.1',  detail: '',                                  status: 'active'  },
  { name: 'Armeria Lv.1',        detail: '',                                  status: 'active'  },
  { name: 'Mensa Lv.1',          detail: '',                                  status: 'active'  },
  { name: "Ponte d'Artiglieria", detail: '',                                  status: 'empty'   },
  { name: 'Unità Medica',        detail: '',                                  status: 'empty'   },
]

const SECTION_DOT: Record<CrawlerSection['status'], string> = {
  active:  'bg-bc-green shadow-[0_0_4px_var(--bc-green)]',
  empty:   'bg-bc-muted/40',
  damaged: 'bg-bc-red shadow-[0_0_4px_var(--bc-red)]',
}
const SECTION_NAME_COLOR: Record<CrawlerSection['status'], string> = {
  active:  'text-bc-text',
  empty:   'text-bc-muted/50',
  damaged: 'text-bc-red',
}

const DEFAULT_INVENTORY: HangarItem[] = [
  { name: 'Scudo Rinforzato',   category: 'Sistema', tec: 2,    quantity: 1, status: 'normale'     },
  { name: 'Bengala a Reattore', category: 'Modulo',  tec: 1,    quantity: 1, status: 'normale'     },
  { name: 'Telaio Hussair',     category: 'Telaio',  tec: null, quantity: 1, status: 'danneggiato' },
  { name: 'Antenna',            category: 'Sistema', tec: 2,    quantity: 4, status: 'normale'     },
]


const MISSION_TEXT: Record<MissionStatus, string> = {
  active: 'text-bc-green', pending: 'text-bc-amber',
  completed: 'text-cyan-400', failed: 'text-bc-red', classified: 'text-bc-blue',
}
const MISSION_STATUS_LABEL: Record<MissionStatus, string> = {
  active: 'ATTIVA', pending: 'IN ATTESA',
  completed: 'COMPLETATA', failed: 'FALLITA', classified: 'CLASSIFICATA',
}
const MISSION_STATUS_COLOR: Record<MissionStatus, string> = {
  active:     'text-bc-green border-bc-green',
  pending:    'text-bc-amber border-bc-amber',
  completed:  'text-cyan-400 border-cyan-400',
  failed:     'text-bc-red border-bc-red',
  classified: 'text-bc-blue border-bc-blue',
}

const LOG_COLOR: Partial<Record<JournalEntryType, string>> = {
  alert:              'bg-bc-red',
  event:              'bg-bc-accent',
  mission:            'bg-bc-blue',
  system:             'bg-bc-muted',
  override:           'bg-bc-amber',
  pilot_registration: 'bg-bc-green',
  pilot_note:         'bg-bc-amber',
}
const LOG_TITLE_COLOR: Partial<Record<JournalEntryType, string>> = {
  alert: 'text-bc-red', event: 'text-bc-green', mission: 'text-bc-blue',
  system: 'text-bc-muted', override: 'text-bc-amber',
  pilot_registration: 'text-bc-green',
}


const INV_STATUS_DOT: Record<HangarItem['status'], string> = {
  normale:     'bg-bc-green shadow-[0_0_4px_var(--bc-green)]',
  danneggiato: 'bg-bc-amber shadow-[0_0_4px_var(--bc-amber)]',
  distrutto:   'bg-bc-red   shadow-[0_0_4px_var(--bc-red)]',
}
const INV_CAT_COLOR: Record<HangarItem['category'], string> = {
  Sistema: 'text-bc-blue',
  Modulo:  'text-bc-blue',
  Telaio:  'text-bc-amber',
  Altro:   'text-bc-muted',
}

function StatChip({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-bc-panel border border-bc-border rounded-xl px-3 py-2.5">
      <div className="font-sans text-bc-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</div>
      <div className={`font-mono text-lg font-bold ${accent}`}>{value}</div>
    </div>
  )
}

function CombinedBarChip({
  psCurrent, psMax, potCurrent, potMax,
}: { psCurrent?: number; psMax?: number; potCurrent?: number; potMax?: number }) {
  const psPct  = psMax  ? Math.min(100, ((psCurrent  ?? 0) / psMax)  * 100) : 0
  const potPct = potMax ? Math.min(100, ((potCurrent ?? 0) / potMax) * 100) : 0
  return (
    <div className="col-span-3 sm:col-span-2 bg-bc-panel border border-bc-border rounded-xl px-3 py-2.5 flex flex-col justify-center gap-2.5">
      <div>
        <div className="flex justify-between font-mono text-xs mb-1">
          <span className="text-bc-muted text-xs uppercase tracking-wider">Scafo</span>
          <span className="text-bc-red font-semibold">{psCurrent ?? '—'}<span className="text-bc-muted font-normal">/{psMax ?? '—'}</span></span>
        </div>
        <div className="h-0.5 rounded-full bg-bc-track overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${psPct}%`, background: 'var(--bc-red)', boxShadow: '0 0 4px var(--bc-red)' }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between font-mono text-xs mb-1">
          <span className="text-bc-muted text-xs uppercase tracking-wider">Potenziamento</span>
          <span className="text-bc-accent font-semibold">{potCurrent ?? '—'}<span className="text-bc-muted font-normal">/{potMax ?? '—'}</span></span>
        </div>
        <div className="h-0.5 rounded-full bg-bc-track overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${potPct}%`, background: 'var(--bc-accent)', boxShadow: '0 0 4px var(--bc-accent)' }} />
        </div>
      </div>
    </div>
  )
}

function Ticker({ text, colorClass }: { text: string; colorClass: string }) {
  const doubled = `${text}      ${text}      `
  return (
    <div className="bc-ticker">
      <span className={`bc-ticker-inner font-sans text-sm font-semibold ${colorClass}`}>{doubled}</span>
    </div>
  )
}

export function OSMainPage() {
  const navigate = useNavigate()
  const { journalEntries, pilots, crawlerSystem, missions } = useOSStore()
  const recentLog      = journalEntries.filter((e) => e.type !== 'pilot_note').slice(0, 12)
  const activeMissions = missions.filter((m) => m.status === 'active')
  const sections       = (crawlerSystem?.sections && crawlerSystem.sections.length > 0)
    ? crawlerSystem.sections : DEFAULT_SECTIONS
  const inventory      = (crawlerSystem?.inventory && crawlerSystem.inventory.length > 0)
    ? crawlerSystem.inventory : DEFAULT_INVENTORY

  const repairStatus = crawlerSystem?.repair_status ?? 'OFFLINE'
  const repairBadge  =
    repairStatus === 'NOMINALE'    ? 'text-bc-green border-bc-green/40 bg-bc-green/10' :
    repairStatus === 'DANNEGGIATO' ? 'text-bc-amber border-bc-amber/40 bg-bc-amber/10' :
                                     'text-bc-red border-bc-red/40 bg-bc-red/10'

  const pinnedId = useMemo(() =>
    [...missions]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .find(m => m.report)?.id ?? null,
    [missions]
  )
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  useEffect(() => {
    if (pinnedId) setExpanded(prev => new Set([...prev, pinnedId]))
  }, [pinnedId])
  const toggleExpanded = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  return (
    <div className="h-full overflow-y-auto lg:overflow-hidden flex flex-col gap-3 p-4 md:p-5 animate-boot-in">

      <div className="shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-widest uppercase leading-none text-bc-text text-glow">
            {crawlerSystem?.crawler_name ?? 'SANCTUARY'}
          </h1>
          <span className={`font-mono text-xs uppercase tracking-widest border px-2 py-0.5 shrink-0 ${repairBadge}`}>
            STATO {repairStatus}
          </span>
        </div>
        <p className="font-sans text-bc-muted text-sm mt-1">
          Crawler {crawlerSystem?.crawler_type ?? "d'Ingegneria"} &nbsp;·&nbsp; {pilots.length} piloti registrati
        </p>
      </div>

      <div className="shrink-0 grid grid-cols-3 sm:grid-cols-5 gap-2">
        <StatChip label="Rottami"         value={String(crawlerSystem?.scrap     ?? '—')} accent="text-bc-amber" />
        <StatChip label="Piloti"          value={String(pilots.length)}                   accent="text-bc-green" />
        <StatChip label="Missioni attive" value={String(activeMissions.length)}           accent="text-bc-accent" />
        <CombinedBarChip
          psCurrent={crawlerSystem?.ps_current}   psMax={crawlerSystem?.ps_max}
          potCurrent={crawlerSystem?.enhancement_current} potMax={crawlerSystem?.enhancement_max}
        />
      </div>

      <div className="shrink-0 flex items-center gap-1.5 font-mono text-xs">
        <span className="text-bc-muted">Manutenzione</span>
        <span className="text-bc-border">·</span>
        <span className="text-bc-amber">{crawlerSystem?.maintenance_cost ?? '—'} rottami / downtime</span>
      </div>

      <div className="shrink-0 h-px bg-bc-track" />

      <div className="shrink-0 flex flex-col lg:flex-row gap-3 lg:flex-1 lg:min-h-0 lg:overflow-hidden">

        <div className="flex flex-col gap-3 lg:flex-1 lg:min-w-0 lg:min-h-0 order-2 lg:order-1">

          <div className="shrink-0 bg-bc-panel border border-bc-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-gradient-to-r from-[#ffc8d8]/15 to-transparent border-b border-bc-border">
              <p className="bc-section-header !border-0 !pb-0 !mb-0">Sezioni crawler</p>
            </div>
            <div className="px-4 py-2 space-y-1">
              {sections.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${SECTION_DOT[s.status]}`} />
                  <div className="min-w-0 flex-1">
                    <div className={`font-mono text-xs font-semibold leading-snug ${SECTION_NAME_COLOR[s.status]}`}>{s.name}</div>
                    {s.detail && <div className="font-mono text-xs text-bc-text/50 leading-snug">{s.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bc-panel border border-bc-border rounded-xl overflow-hidden flex flex-col lg:flex-1 lg:min-h-0">
          <div className="px-4 py-2.5 bg-gradient-to-r from-[#ffc8d8]/15 to-transparent border-b border-bc-border shrink-0">
            <p className="bc-section-header !border-0 !pb-0 !mb-0">Archivio log recente</p>
          </div>
          <div className="p-4 overflow-y-auto flex-1 min-h-0">
            {recentLog.length === 0 ? (
              <p className="font-sans text-bc-muted text-sm">Nessuna voce nel log.</p>
            ) : (
              <div className="space-y-0">
                {recentLog.map((entry: JournalEntry, i) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${LOG_COLOR[entry.type] ?? 'bg-bc-muted'}`} />
                      {i < recentLog.length - 1 && <div className="flex-1 w-px bg-bc-track mt-1" />}
                    </div>
                    <div className="pb-4 min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-bc-muted text-xs shrink-0">
                          {new Date(entry.created_at).toLocaleString('it-IT', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                        <span className="font-sans text-xs text-bc-muted/60 uppercase tracking-wider shrink-0">{entry.type}</span>
                      </div>
                      {i === 0 ? (
                        <Ticker text={entry.title} colorClass={LOG_TITLE_COLOR[entry.type] ?? 'text-bc-text'} />
                      ) : (
                        <div className={`font-sans text-sm font-semibold truncate ${LOG_TITLE_COLOR[entry.type] ?? 'text-bc-text'}`}>{entry.title}</div>
                      )}
                      {entry.content && (
                        <div className="font-sans text-xs text-bc-muted mt-0.5 leading-relaxed line-clamp-2">{entry.content}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-[2] lg:min-w-0 lg:min-h-0 order-1 lg:order-2">
          <div
            className="bg-bc-panel border border-bc-border rounded-xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-0 lg:flex-1"
          >
            <div className="px-4 py-2.5 bg-gradient-to-r from-[#ffc8d8]/15 to-transparent border-b border-bc-border shrink-0 flex items-center justify-between">
              <p className="bc-section-header !border-0 !pb-0 !mb-0">Missioni correnti</p>
              <span className="font-mono text-[10px] text-bc-muted/50">
                {missions.filter(m => m.status === 'active').length} attive
              </span>
            </div>
            <div className="p-3 lg:overflow-y-auto lg:flex-1 lg:min-h-0 space-y-2">
              {missions.length === 0 ? (
                <p className="font-sans text-bc-muted text-sm">Nessuna missione nel sistema.</p>
              ) : (
                missions.map((m) => {
                  const isExpanded = expanded.has(m.id)
                  const isPinned = m.id === pinnedId
                  const statusColor = MISSION_STATUS_COLOR[m.status]
                  return (
                    <div
                      key={m.id}
                      className={`rounded-lg border bg-bc-dark/40 overflow-hidden transition-all ${
                        isPinned ? 'border-bc-accent/40' : 'border-bc-border/60'
                      }`}
                    >
                    <div
                      className={`px-3 py-2.5 flex items-center gap-2 border-b border-bc-border/30 bg-gradient-to-r ${
                        m.status === 'active' ? 'from-bc-green/8 to-transparent' :
                        m.status === 'pending' ? 'from-bc-amber/8 to-transparent' :
                        m.status === 'failed' ? 'from-bc-red/8 to-transparent' :
                        'from-bc-muted/5 to-transparent'
                      }`}>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            m.status === 'active' ? 'bg-bc-green shadow-[0_0_4px_var(--bc-green)]' :
                            m.status === 'pending' ? 'bg-bc-amber shadow-[0_0_4px_var(--bc-amber)]' :
                            m.status === 'failed' ? 'bg-bc-red shadow-[0_0_4px_var(--bc-red)]' :
                            'bg-bc-muted/40'
                          }`} />
                          <span className={`font-mono text-sm font-bold md:truncate break-words ${MISSION_TEXT[m.status]}`}>
                            {m.title}
                          </span>
                          {isPinned && <Diamond size={10} strokeWidth={1.5} className="text-bc-accent/60 shrink-0" />}
                        </div>
                        <span className={`bc-tag text-xs shrink-0 ${statusColor}`}>{MISSION_STATUS_LABEL[m.status]}</span>
                        {m.report && (
                          <button
                            className="shrink-0 w-8 h-8 flex items-center justify-center text-bc-muted hover:text-bc-accent border border-bc-border/40 hover:border-bc-accent/50 rounded transition-colors"
                            onClick={e => toggleExpanded(m.id, e)}
                          >
                            {isExpanded ? <ChevronUp size={14} strokeWidth={2} /> : <ChevronDown size={14} strokeWidth={2} />}
                          </button>
                        )}
                      </div>

                      <div className="px-3 py-2.5 space-y-2">
                        {m.report?.date && (
                          <p className="font-mono text-xs text-bc-muted/60">
                            {[m.report.date, m.report.place ?? m.report.theater].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        {m.reward && (
                          <div className="flex items-center gap-1.5">
                            <CornerDownRight size={11} strokeWidth={1.5} className="text-bc-muted/40 shrink-0" />
                            <span className="font-mono text-sm text-bc-amber">{m.reward}</span>
                          </div>
                        )}
                        {m.report?.priorities && m.report.priorities.length > 0 && (
                          <div className="flex items-start gap-1.5">
                            <AlertCircle size={11} strokeWidth={2} className="text-bc-red/60 mt-0.5 shrink-0" />
                            <span className="font-sans text-xs text-bc-text/70 leading-snug line-clamp-2">
                              {m.report.priorities[0]}
                            </span>
                          </div>
                        )}
                      </div>

                      {isExpanded && m.report && (
                        <div className="px-3 pb-3 pt-1 border-t border-bc-border/20 space-y-2" onClick={e => e.stopPropagation()}>
                          <div className="grid grid-cols-2 gap-2">
                            {m.report.discoveries && m.report.discoveries.length > 0 && (
                              <div className="bg-bc-black/30 border border-bc-border/30 rounded-lg p-2">
                                <p className="flex items-center gap-1 font-mono text-[10px] text-bc-text/50 uppercase tracking-widest mb-1.5">
                                  <Diamond size={9} strokeWidth={1.5} />Scoperte
                                </p>
                                <div className="space-y-1">
                                  {m.report.discoveries.map((d, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                      <Diamond size={9} strokeWidth={1.5} className="text-bc-accent/50 shrink-0" />
                                      <span className="font-sans text-xs text-bc-text/80 leading-snug">{d.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="bg-bc-black/30 border border-bc-border/30 rounded-lg p-2">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <p className="flex items-center gap-1 font-mono text-[10px] text-bc-text/50 uppercase tracking-widest">
                                  <Diamond size={9} strokeWidth={1.5} />Contratti
                                </p>
                                {m.report.contractsIncompatible && (
                                  <span className="font-mono text-[10px] text-bc-red border border-bc-red/40 px-1 rounded py-0.5">!</span>
                                )}
                              </div>
                              {m.report.contracts && m.report.contracts.length > 0 ? (
                                <div className="space-y-1">
                                  {m.report.contracts.map((c, i) => (
                                    <div key={i} className="space-y-0.5">
                                      <p className="font-mono text-xs text-bc-text font-semibold">{c.name}</p>
                                      <p className="font-mono text-[10px] text-bc-amber">{c.reward}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="font-mono text-xs text-bc-muted/50">Nessun contratto disponibile.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-1 lg:min-w-0 lg:min-h-0 order-3 lg:order-3">

          {crawlerSystem?.merchant_bridge && (
            <div className="shrink-0 bg-bc-panel border border-bc-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-gradient-to-r from-[#ffc8d8]/15 to-transparent border-b border-bc-border">
                <p className="bc-section-header !border-0 !pb-0 !mb-0">Ponte mercantile</p>
              </div>
              <div className="p-4 space-y-2">
                {crawlerSystem.merchant_bridge.split('|').map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-bc-border last:border-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-bc-green shadow-[0_0_4px_var(--bc-green)] shrink-0" />
                    <span className="font-mono text-xs font-semibold text-bc-green/80 flex-1 min-w-0 truncate">{item.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="bg-bc-panel border border-bc-border rounded-xl overflow-hidden flex flex-col lg:flex-1 lg:min-h-0 cursor-pointer hover:border-bc-accent/50 transition-colors"
            onClick={() => navigate('/hangar')}
          >
            <div className="px-4 py-2.5 bg-gradient-to-r from-[#ffc8d8]/15 to-transparent border-b border-bc-border shrink-0">
              <p className="bc-section-header !border-0 !pb-0 !mb-0">Hangar</p>
            </div>
            <div className="p-4 lg:overflow-y-auto lg:flex-1 lg:min-h-0 space-y-2">
              {inventory.map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-bc-border last:border-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${INV_STATUS_DOT[item.status]}`} />
                  <span className={`font-mono text-xs font-semibold flex-1 min-w-0 ${item.status === 'distrutto' ? 'line-through text-bc-muted' : INV_CAT_COLOR[item.category]}`}>
                    {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                  </span>
                  <span className="font-mono text-xs text-bc-muted shrink-0">
                    {item.category}{item.tec != null ? ` T${item.tec}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
