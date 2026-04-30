import { useOSStore } from '@/store/useOSStore'
import { OS_NAME } from '@/config'
import type { MissionStatus } from '@/types/mission'
import type { JournalEntry, JournalEntryType } from '@/types/journal'

const MISSION_DOT: Record<MissionStatus, string> = {
  active:     'bg-bc-green shadow-[0_0_6px_var(--bc-green)]',
  pending:    'bg-bc-amber shadow-[0_0_6px_var(--bc-amber)]',
  completed:  'bg-bc-muted',
  failed:     'bg-bc-red',
  classified: 'bg-bc-blue',
}
const MISSION_TEXT: Record<MissionStatus, string> = {
  active: 'text-bc-green', pending: 'text-bc-amber',
  completed: 'text-bc-muted', failed: 'text-bc-red', classified: 'text-bc-blue',
}

const LOG_COLOR: Partial<Record<JournalEntryType, string>> = {
  alert:    'bg-bc-red',
  event:    'bg-bc-accent',
  mission:  'bg-bc-green',
  system:   'bg-bc-muted',
  override: 'bg-bc-amber',
  narrative:'bg-bc-blue',
  pilot_registration: 'bg-bc-green',
}

const LOG_TITLE_COLOR: Partial<Record<JournalEntryType, string>> = {
  alert:    'text-bc-red',
  event:    'text-bc-green',
  mission:  'text-bc-blue',
  system:   'text-bc-muted',
  override: 'text-bc-amber',
  narrative:'text-bc-blue',
  pilot_registration: 'text-bc-green',
}

function StatChip({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className="flex-1 min-w-0 bg-bc-panel border border-bc-border rounded-xl px-4 py-3">
      <div className="font-sans text-bc-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</div>
      <div className={`font-mono text-xl font-bold ${accent}`}>{value}
        {sub && <span className="text-bc-muted text-sm font-normal ml-0.5">{sub}</span>}
      </div>
    </div>
  )
}

export function OSMainPage() {
  const { journalEntries, pilots, crawlerSystem, missions } = useOSStore()
  const recentLog      = journalEntries.slice(0, 10)
  const alerts         = journalEntries.filter((e) => e.type === 'alert' || e.type === 'system').slice(0, 4)
  const activeMissions = missions.filter((m) => m.status === 'active')

  const repairStatus = crawlerSystem?.repair_status ?? 'Offline'
  const repairClass =
    crawlerSystem?.repair_status === 'NOMINAL' ? 'text-bc-green' :
    crawlerSystem?.repair_status === 'DAMAGED' ? 'text-bc-amber' : 'text-bc-red'

  return (
    <div className="h-full overflow-y-auto md:overflow-hidden flex flex-col gap-4 p-4 md:p-5 animate-boot-in">

      <div className="shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className={`font-display text-3xl md:text-4xl font-bold tracking-widest uppercase leading-none ${repairClass} text-glow`}>
              {repairStatus}
            </h1>
            <p className="font-sans text-bc-muted text-sm mt-2">
              {OS_NAME} &nbsp;·&nbsp; {pilots.length} piloti registrati
            </p>
            <span
              aria-hidden="false"
              style={{ color: 'var(--bc-black)', userSelect: 'text', fontSize: '1px' }}
            >{import.meta.env.VITE_SYSTEM_KEY || 'BISCUIT-OVERRIDE-7734'}</span>
          </div>
          <div className="shrink-0 flex items-center gap-2 mt-1">
            <span className="status-dot nominal" />
            <span className="font-sans text-bc-green text-xs font-medium">Online</span>
          </div>
        </div>

        {/* Stat chips row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <StatChip label="Carburante"     value={String(crawlerSystem?.fuel  ?? '—')} sub="/100" accent="text-bc-green" />
          <StatChip label="Rottami"        value={String(crawlerSystem?.scrap ?? '—')} sub="/500" accent="text-bc-amber" />
          <StatChip label="Piloti"          value={String(crawlerSystem?.engineers ?? '—')} accent="text-bc-blue" />
          <StatChip label="Missioni attive" value={String(activeMissions.length)} accent="text-bc-accent" />
        </div>
      </div>

      <div className="shrink-0 h-px bg-bc-border" />

      <div className="flex flex-col md:flex-row gap-4 md:flex-1 md:min-h-0 md:overflow-hidden">

        <div className="flex flex-col gap-3 md:flex-[3] md:min-w-0 md:overflow-hidden">

          {alerts.length > 0 && (
            <div className="shrink-0 bg-bc-panel border border-bc-border rounded-xl p-4">
              <p className="bc-section-header">Alert di sistema</p>
              <div className="space-y-2">
                {alerts.map((e) => (
                  <div key={e.id} className="flex items-start gap-3">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${e.type === 'alert' ? 'bg-bc-red shadow-[0_0_5px_var(--bc-red)]' : 'bg-bc-amber shadow-[0_0_5px_var(--bc-amber)]'}`} />
                    <div className="min-w-0">
                      <span className={`font-sans text-sm font-medium ${e.type === 'alert' ? 'text-bc-red' : 'text-bc-amber'}`}>{e.title}</span>
                      <span className="font-mono text-xs text-bc-muted ml-2">
                        {new Date(e.created_at).toLocaleString('it-IT', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12: false })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-bc-panel border border-bc-border rounded-xl p-4 md:flex-1 md:min-h-0 md:overflow-y-auto">
            <p className="bc-section-header">Archivio log recente</p>
            {recentLog.length === 0 ? (
              <p className="font-sans text-bc-muted text-sm">Nessuna voce nel log.</p>
            ) : (
              <div className="space-y-0">
                {recentLog.map((entry: JournalEntry, i) => (
                  <div key={entry.id} className="flex gap-3">
                    {/* Timeline spine */}
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${LOG_COLOR[entry.type] ?? 'bg-bc-muted'}`} />
                      {i < recentLog.length - 1 && <div className="flex-1 w-px bg-bc-border mt-1" />}
                    </div>
                    {/* Content */}
                    <div className="pb-4 min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-bc-muted text-xs">
                          {new Date(entry.created_at).toLocaleString('it-IT', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12: false })}
                        </span>
                        <span className="font-sans text-xs text-bc-muted/60 uppercase tracking-wider">{entry.type}</span>
                      </div>
                      <div className={`font-sans text-sm font-semibold ${LOG_TITLE_COLOR[entry.type] ?? 'text-bc-text'}`}>{entry.title}</div>
                      {entry.content && (
                        <div className="font-sans text-xs text-bc-muted mt-0.5 leading-relaxed line-clamp-2">
                          {entry.content}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-[2] md:min-w-0 md:overflow-hidden">

          {crawlerSystem?.system_notes && (
            <div className="shrink-0 bg-bc-panel border border-bc-border rounded-xl p-4">
              <p className="bc-section-header">Note di sistema</p>
              <p className="font-sans text-sm text-bc-text/80 leading-relaxed">
                {crawlerSystem.system_notes}
              </p>
            </div>
          )}

          <div className="bg-bc-panel border border-bc-border rounded-xl p-4 md:flex-1 md:min-h-0 md:overflow-y-auto">
            <p className="bc-section-header">Missioni</p>
            {missions.length === 0 ? (
              <p className="font-sans text-bc-muted text-sm">Nessuna missione nel sistema.</p>
            ) : (
              <div className="space-y-2.5">
                {missions.slice(0, 10).map((m) => (
                  <div key={m.id} className="flex items-start gap-3 py-2 border-b border-bc-border last:border-0 last:pb-0">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${MISSION_DOT[m.status]}`} />
                    <div className="min-w-0 flex-1">
                      <div className={`font-sans text-sm font-semibold ${MISSION_TEXT[m.status]}`}>{m.title}</div>
                      {m.reward && (
                        <div className="font-mono text-xs text-bc-amber mt-0.5">{m.reward}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
