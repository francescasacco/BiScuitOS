import { useOSStore } from '@/store/useOSStore'
import { LogEntry } from '@/components/journal/LogEntry'
import { OS_NAME } from '@/config'
import type { MissionStatus } from '@/types/mission'

const MISSION_COLORS: Record<MissionStatus, string> = {
  active:     'text-bc-green',
  pending:    'text-bc-amber',
  completed:  'text-bc-muted',
  failed:     'text-bc-red',
  classified: 'text-bc-blue',
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="h-1 bg-bc-black border border-bc-border/20 overflow-hidden">
      <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 4px ${color}` }} />
    </div>
  )
}

export function OSMainPage() {
  const { journalEntries, pilots, crawlerSystem, missions } = useOSStore()
  const recentLog      = journalEntries.slice(0, 8)
  const alerts         = journalEntries.filter((e) => e.type === 'alert' || e.type === 'system').slice(0, 5)
  const activeMissions = missions.filter((m) => m.status === 'active')

  const repairColor =
    crawlerSystem?.repair_status === 'NOMINAL' ? 'var(--bc-green)' :
    crawlerSystem?.repair_status === 'DAMAGED' ? 'var(--bc-amber)' : 'var(--bc-red)'

  return (
    <div className="h-full overflow-hidden flex flex-col gap-2 p-3 animate-boot-in">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between pb-2 border-b border-bc-border">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-bold text-bc-green text-glow tracking-widest">FEED PRINCIPALE</span>
          <span className="font-mono text-bc-muted text-xs hidden sm:inline">// {OS_NAME}</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs text-bc-muted">
          <span><span className="text-bc-blue">{pilots.length}</span> PILOTI</span>
          <span><span className="text-bc-green">{activeMissions.length}</span> MISSIONI ATTIVE</span>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex gap-2 overflow-hidden">

        {/* ━━ LEFT narrow column ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-44 shrink-0 flex flex-col gap-2 min-h-0 overflow-hidden">

          {/* RISORSE — compact, no scroll */}
          <div
            className="shrink-0 bc-panel border border-bc-border p-3"
            style={{ borderLeftColor: 'var(--bc-green)', borderLeftWidth: '2px' }}
          >
            <div className="font-mono text-bc-green/60 text-xs tracking-widest mb-2">// RISORSE</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between font-mono text-xs mb-1">
                  <span className="text-bc-muted">CARB.</span>
                  <span className="text-bc-green">{crawlerSystem?.fuel ?? '—'}<span className="text-bc-muted/40">/100</span></span>
                </div>
                <Bar value={crawlerSystem?.fuel ?? 0} max={100} color="var(--bc-green)" />
              </div>
              <div>
                <div className="flex justify-between font-mono text-xs mb-1">
                  <span className="text-bc-muted">ROTTAMI</span>
                  <span className="text-bc-amber">{crawlerSystem?.scrap ?? '—'}<span className="text-bc-muted/40">/500</span></span>
                </div>
                <Bar value={crawlerSystem?.scrap ?? 0} max={500} color="var(--bc-amber)" />
              </div>
              <div className="flex justify-between font-mono text-xs pt-1 border-t border-bc-border/30">
                <span className="text-bc-muted">ENG.</span>
                <span className="text-bc-blue">{crawlerSystem?.engineers ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* MISSIONI ATTIVE — scrollable */}
          <div
            className="flex-1 min-h-0 overflow-y-auto bc-panel border border-bc-border p-3"
            style={{ borderLeftColor: 'var(--bc-amber)', borderLeftWidth: '2px' }}
          >
            <div className="font-mono text-bc-amber/60 text-xs tracking-widest mb-2">// MISSIONI</div>
            {missions.length === 0 ? (
              <p className="font-mono text-bc-muted/60 text-xs">NESSUNA MISSIONE</p>
            ) : (
              <div className="space-y-2">
                {missions.slice(0, 8).map((m) => (
                  <div key={m.id} className="border-b border-bc-border/20 pb-2 last:border-0 last:pb-0">
                    <div className={`font-mono text-xs font-bold ${MISSION_COLORS[m.status]} leading-tight`}>
                      {m.title}
                    </div>
                    {m.reward && (
                      <div className="font-mono text-xs text-bc-amber/60 mt-0.5">{m.reward}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ━━ RIGHT main area ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 min-h-0 overflow-hidden">

          {/* STATO CRAWLER — natural height */}
          <div
            className="shrink-0 bc-panel border border-bc-border p-3"
            style={{ borderLeftColor: 'var(--bc-green)', borderLeftWidth: '2px' }}
          >
            <div className="font-mono text-bc-green/60 text-xs tracking-widest mb-2">// STATO CRAWLER</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <div>
                <div className="font-mono text-bc-muted text-xs">RIPARAZIONE</div>
                <div className="font-mono text-sm font-bold" style={{ color: repairColor }}>
                  {crawlerSystem?.repair_status ?? 'SCONOSCIUTO'}
                </div>
              </div>
              <div>
                <div className="font-mono text-bc-muted text-xs">PONTE MERCANTE</div>
                <div className="font-mono text-sm text-bc-green">
                  {crawlerSystem?.merchant_bridge ?? '—'}
                </div>
              </div>
              {crawlerSystem?.active_alerts && crawlerSystem.active_alerts !== 'NONE' && (
                <div className="col-span-2 mt-1">
                  <div className="font-mono text-bc-muted text-xs">ALERT ATTIVI</div>
                  <div className="font-mono text-xs text-bc-amber">{crawlerSystem.active_alerts}</div>
                </div>
              )}
              {crawlerSystem?.system_notes && (
                <div className="col-span-2 mt-1 pt-1 border-t border-bc-border/30">
                  <div className="font-mono text-xs text-bc-green/60 leading-relaxed whitespace-pre-wrap">
                    {crawlerSystem.system_notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ALERT FEED — natural height */}
          <div
            className="shrink-0 bc-panel border border-bc-border p-3"
            style={{ borderLeftColor: 'var(--bc-red)', borderLeftWidth: '2px' }}
          >
            <div className="font-mono text-bc-red/60 text-xs tracking-widest mb-2">// ALERT FEED</div>
            {alerts.length === 0 ? (
              <p className="font-mono text-bc-muted/60 text-xs">SISTEMI NOMINALI — NESSUN ALERT</p>
            ) : (
              <div className="space-y-1.5">
                {alerts.map((e) => (
                  <div key={e.id} className="flex items-start gap-2">
                    <span className={`shrink-0 font-mono text-xs font-bold ${e.type === 'alert' ? 'text-bc-red' : 'text-bc-amber'}`}>
                      {e.type === 'alert' ? '⚠' : '◈'}
                    </span>
                    <div className="min-w-0">
                      <div className={`font-mono text-xs font-bold truncate ${e.type === 'alert' ? 'text-bc-red' : 'text-bc-amber'}`}>
                        {e.title}
                      </div>
                      <div className="font-mono text-xs text-bc-muted/50">
                        {new Date(e.created_at).toLocaleString('it-IT', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LOG ARCHIVIO — takes all remaining space, scrollable */}
          <div
            className="flex-1 min-h-0 overflow-y-auto bc-panel border border-bc-border p-3"
            style={{ borderLeftColor: 'var(--bc-blue)', borderLeftWidth: '2px' }}
          >
            <div className="font-mono text-bc-blue/60 text-xs tracking-widest mb-2">// ARCHIVIO LOG RECENTE</div>
            {recentLog.length === 0 ? (
              <p className="font-mono text-bc-muted/60 text-xs">NESSUNA VOCE NEL LOG — ARCHIVIO VUOTO</p>
            ) : (
              <div className="space-y-3">
                {recentLog.map((entry) => (
                  <LogEntry key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
