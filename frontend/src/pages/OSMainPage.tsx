import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOSStore } from '@/store/useOSStore'
import { Diamond, CornerDownRight, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react'
import type { MissionStatus } from '@/types/mission'
import type { JournalEntry, JournalEntryType } from '@/types/journal'
import type { CrawlerSection, HangarItem } from '@/types/system'
import { StatChip, CombinedBarChip, Ticker } from '@/components/ui/FeedWidgets'
import { STATUS_DOT as MISSION_STATUS_DOT, STATUS_BORDER_IDLE, STATUS_DIVIDER, STATUS_COLOR_VAR, STATUS_GLOW, STATUS_LABELS, STATUS_COLORS } from '@/components/missions/missionConstants'
import { TaskBoardWidget } from '@/components/ui/TaskBoardWidget'


const DEFAULT_SECTIONS: CrawlerSection[] = [
  { name: 'Ponte Comando',       detail: '', status: 'empty' },
  { name: 'Ponte Mech',          detail: '', status: 'empty' },
  { name: 'Officina Meccanica',  detail: '', status: 'empty' },
  { name: 'Cabine Piloti',       detail: '', status: 'empty' },
  { name: 'Armeria',             detail: '', status: 'empty' },
  { name: 'Mensa',              detail: '', status: 'empty' },
  { name: "Ponte d'Artiglieria", detail: '', status: 'empty' },
  { name: 'Unità Medica',        detail: '', status: 'empty' },
]

const CAT_ORDER: Record<string, number> = { Sistema: 0, Modulo: 1, Mech: 2, Telaio: 3, Altro: 4 }

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



const MISSION_TEXT: Record<MissionStatus, string> = {
  active: 'text-bc-green', pending: 'text-bc-amber',
  completed: 'text-cyan-400', failed: 'text-bc-red', classified: 'text-bc-blue',
}

const LOG_COLOR: Partial<Record<JournalEntryType, string>> = {
  alert:              'bg-bc-red',
  event:              'bg-bc-orange',
  mission:            'bg-bc-blue',
  system:             'bg-bc-muted',
  override:           'bg-bc-amber',
  pilot_registration: 'bg-bc-green',
  pilot_note:         'bg-bc-amber',
  trade:              'bg-bc-orange',
}
const LOG_TYPE_LABEL: Partial<Record<JournalEntryType, string>> = {
  alert:              'ALERT',
  event:              'EVENTO',
  mission:            'MISSIONE',
  system:             'SISTEMA',
  override:           'OVERRIDE',
  pilot_registration: 'REGISTRAZIONE',
  pilot_note:         'NOTA PILOTA',
  trade:              'SCAMBIO',
}


const LOG_TITLE_COLOR: Partial<Record<JournalEntryType, string>> = {
  alert:              'text-bc-red',
  event:              'text-bc-orange',
  mission:            'text-bc-blue',
  system:             'text-bc-muted',
  override:           'text-bc-amber',
  pilot_registration: 'text-bc-green',
  pilot_note:         'text-bc-amber',
  trade:              'text-bc-orange',
}

const INV_STATUS_DOT: Record<HangarItem['status'], string> = {
  normale:     'bg-bc-green shadow-[0_0_4px_var(--bc-green)]',
  danneggiato: 'bg-bc-amber shadow-[0_0_4px_var(--bc-amber)]',
  distrutto:   'bg-bc-red   shadow-[0_0_4px_var(--bc-red)]',
}
const INV_CAT_COLOR: Record<HangarItem['category'], string> = {
  Sistema:   'text-bc-blue',
  Modulo:    'text-bc-accent',
  Mech:      'text-yellow-200',
  Telaio:    'text-bc-red',
  Altro:     'text-bc-green',
}

function LogTimeline({ entries, ticker = false }: { entries: JournalEntry[]; ticker?: boolean }) {
  if (entries.length === 0) return <p className="font-sans text-bc-muted text-sm">Nessuna voce nel log.</p>
  return (
    <div className="space-y-0">
      {entries.map((entry, i) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${LOG_COLOR[entry.type] ?? 'bg-bc-muted'}`} />
            {i < entries.length - 1 && <div className="flex-1 w-px bg-bc-track mt-1" />}
          </div>
          <div className="pb-4 min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-bc-muted text-xs shrink-0">
                {new Date(entry.created_at).toLocaleString('it-IT', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
              <span className="font-sans text-xs text-bc-muted/60 uppercase tracking-wider shrink-0">{LOG_TYPE_LABEL[entry.type] ?? entry.type}</span>
            </div>
            {ticker && i === 0 ? (
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
  )
}

export function OSMainPage() {
  const navigate = useNavigate()
  const { journalEntries, pilots, crawlerSystem, missions } = useOSStore()
  const recentLog      = journalEntries.filter((e) => e.type !== 'pilot_note').slice(0, 12)
  const activeMissions = missions.filter((m) => m.status === 'active')
  const sections = (crawlerSystem?.sections && crawlerSystem.sections.length > 0)
    ? crawlerSystem.sections : DEFAULT_SECTIONS
  const inventory = [...(crawlerSystem?.inventory ?? [])].sort((a, b) => (CAT_ORDER[a.category] ?? 5) - (CAT_ORDER[b.category] ?? 5))

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
            {crawlerSystem?.crawler_name ?? 'CRAWLER-00'}
          </h1>
          {crawlerSystem?.crawler_tec != null && (
            <span className="font-mono text-xs uppercase tracking-widest border px-2 py-0.5 shrink-0 text-bc-accent border-bc-accent/40">
              TEC {crawlerSystem.crawler_tec}
            </span>
          )}
          <span className={`font-mono text-xs uppercase tracking-widest border px-2 py-0.5 shrink-0 ${repairBadge}`}>
            STATO {repairStatus}
          </span>
        </div>
        <p className="font-sans text-bc-muted text-sm mt-1">
          {crawlerSystem?.crawler_type ? `Crawler ${crawlerSystem.crawler_type}` : 'Crawler'} &nbsp;·&nbsp; {pilots.length} piloti registrati
        </p>
      </div>

      <div className="shrink-0 grid grid-cols-3 sm:grid-cols-5 gap-2">
        <StatChip label="Rottami"         value={crawlerSystem?.scrap ?? '—'} accent="text-bc-amber" />
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

          <div className="hidden lg:flex bg-bc-panel border border-bc-border rounded-xl overflow-hidden flex-col lg:flex-1 lg:min-h-0">
          <div className="px-4 py-2.5 bg-gradient-to-r from-[#ffc8d8]/15 to-transparent border-b border-bc-border shrink-0">
            <p className="bc-section-header !border-0 !pb-0 !mb-0">Archivio log recente</p>
          </div>
          <div className="p-4 overflow-y-auto flex-1 min-h-0">
            <LogTimeline entries={recentLog} ticker />
          </div>
        </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-[2] lg:min-w-0 lg:min-h-0 order-1 lg:order-2">
          <div
            className="bg-bc-panel border border-bc-border rounded-xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-0 lg:flex-1"
          >
            <div className="px-4 py-2.5 bg-gradient-to-r from-[#ffc8d8]/15 to-transparent border-b border-bc-border shrink-0 flex items-center justify-between">
              <p className="bc-section-header !border-0 !pb-0 !mb-0">Missioni correnti</p>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest border px-1.5 py-0.5 text-bc-green border-bc-green/40 bg-bc-green/10">
                {activeMissions.length} attive
              </span>
            </div>
            <div className="p-3 lg:overflow-y-auto lg:flex-1 lg:min-h-0 space-y-2">
              <TaskBoardWidget />
              {missions.length === 0 ? (
                <p className="font-sans text-bc-muted text-sm">Nessuna missione nel sistema.</p>
              ) : (
                missions.map((m) => {
                  const isExpanded = expanded.has(m.id)
                  const isPinned = m.id === pinnedId
                  const statusColor = STATUS_COLORS[m.status]
                  return (
                    <div
                      key={m.id}
                      className={`rounded-lg border bg-bc-dark/40 overflow-hidden transition-all cursor-pointer hover:border-bc-accent/40 ${
                        isPinned ? 'border-bc-accent/40' : STATUS_BORDER_IDLE[m.status]
                      }`}
                      style={{ '--mission-color': STATUS_COLOR_VAR[m.status] } as React.CSSProperties}
                      onClick={() => navigate('/missions')}
                    >
                    <div
                      className={`px-3 py-2.5 flex items-center gap-2 border-b ${STATUS_DIVIDER[m.status]} bg-gradient-to-r ${STATUS_GLOW[m.status]}`}>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${MISSION_STATUS_DOT[m.status]}`} />
                          <span className={`font-mono text-sm font-bold md:truncate break-words ${MISSION_TEXT[m.status]}`}>
                            {m.title}
                          </span>
                          {isPinned && <Diamond size={13} strokeWidth={1.5} className="shrink-0" style={{ color: 'var(--mission-color)' }} />}
                        </div>
                        <span className={`bc-tag text-xs shrink-0 ${statusColor}`}>{STATUS_LABELS[m.status]}</span>
                        {m.report && (
                          <button
                            className="shrink-0 w-8 h-8 flex items-center justify-center rounded transition-colors"
                            style={{ border: '1px solid color-mix(in srgb, var(--mission-color) 30%, transparent)', color: 'color-mix(in srgb, var(--mission-color) 50%, transparent)' }}
                            onClick={e => toggleExpanded(m.id, e)}
                          >
                            {isExpanded ? <ChevronUp size={14} strokeWidth={2} /> : <ChevronDown size={14} strokeWidth={2} />}
                          </button>
                        )}
                      </div>

                      <div className="px-3 py-2.5 space-y-2">
                        {m.report?.date && (
                          <p className="font-mono text-xs text-bc-muted/60">
                            {[m.report.date, m.report.place].filter(Boolean).join(' · ')}
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
                        <div className={`px-3 pb-3 pt-1 border-t ${STATUS_DIVIDER[m.status]} space-y-2`} onClick={e => e.stopPropagation()}>
                          <div className="grid grid-cols-2 gap-2">
                            {m.report.discoveries && m.report.discoveries.length > 0 && (
                              <div className={`bg-bc-black/30 border ${STATUS_DIVIDER[m.status]} rounded-lg p-2`}>
                                <p className="flex items-center gap-1 font-mono text-[10px] text-bc-text/50 uppercase tracking-widest mb-1.5">
                                  <Diamond size={9} strokeWidth={1.5} />Scoperte
                                </p>
                                <div className="space-y-1">
                                  {m.report.discoveries.map((d, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                      <Diamond size={11} strokeWidth={1.5} fill="currentColor" className="shrink-0" style={{ color: 'color-mix(in srgb, var(--mission-color) 70%, transparent)' }} />
                                      <span className="font-sans text-xs text-bc-text/80 leading-snug">{d.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className={`bg-bc-black/30 border ${STATUS_DIVIDER[m.status]} rounded-lg p-2`}>
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

        <div className="flex flex-col gap-3 lg:flex-1 lg:min-w-0 lg:min-h-0 order-3">

          <div
            className="bg-bc-panel border border-bc-border rounded-xl overflow-hidden flex flex-col lg:flex-1 lg:min-h-0 cursor-pointer hover:border-bc-accent/50 transition-colors"
            onClick={() => navigate('/hangar')}
          >
            <div className="px-4 py-2.5 bg-gradient-to-r from-[#ffc8d8]/15 to-transparent border-b border-bc-border shrink-0">
              <p className="bc-section-header !border-0 !pb-0 !mb-0">Hangar</p>
            </div>
            <div className="p-4 lg:overflow-y-auto lg:flex-1 lg:min-h-0 space-y-2">
              {inventory.length === 0 ? (
                <p className="font-mono text-xs text-bc-muted">Nessuna voce nell'hangar.</p>
              ) : inventory.map((item, i) => (
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

          {crawlerSystem?.merchant_bridge && crawlerSystem.merchant_bridge.length > 0 && (
            <div className="shrink-0 bg-bc-panel border border-bc-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-gradient-to-r from-[#ffc8d8]/15 to-transparent border-b border-bc-border">
                <p className="bc-section-header !border-0 !pb-0 !mb-0">Ponte mercantile</p>
              </div>
              <div className="p-4 space-y-2">
                {[...crawlerSystem.merchant_bridge].sort((a, b) => (CAT_ORDER[a.category] ?? 5) - (CAT_ORDER[b.category] ?? 5)).map((item, i) => (
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
          )}

        </div>

        <div className="lg:hidden order-4 bg-bc-panel border border-bc-border rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-gradient-to-r from-[#ffc8d8]/15 to-transparent border-b border-bc-border shrink-0">
            <p className="bc-section-header !border-0 !pb-0 !mb-0">Archivio log recente</p>
          </div>
          <div className="p-4">
            <LogTimeline entries={recentLog} />
          </div>
        </div>

      </div>

      <div style={{ position: 'fixed', bottom: '-1px', right: '24px', color: '#64748b', fontSize: '0.72rem', textAlign: 'right', lineHeight: '1.8', pointerEvents: 'none', zIndex: 1 }}
        className="hidden sm:block"
      >
        <div>2026@FrancescaSacco</div>
      </div>
      <div style={{ color: '#64748b', fontSize: '0.72rem', textAlign: 'right', lineHeight: '1.8', pointerEvents: 'none' }}
        className="sm:hidden px-4 pb-1 mt-2"
      >
        <div>2026@FrancescaSacco</div>
      </div>
    </div>
  )
}
