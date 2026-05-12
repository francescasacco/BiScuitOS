import { useOSStore } from '@/store/useOSStore'

export function AlertFeed() {
  const { journalEntries } = useOSStore()
  const alerts = journalEntries.filter((e) => e.type === 'alert' || e.type === 'system').slice(0, 5)

  return (
    <div className="bc-panel border border-bc-border p-3">
      <div className="bc-section-header">FEED ALERT</div>
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <p className="font-mono text-bc-muted text-xs">NESSUN ALERT ATTIVO — SISTEMI NOMINALI</p>
        ) : (
          alerts.map((entry) => (
            <div
              key={entry.id}
              className={`border-l-2 pl-3 py-1 ${
                entry.type === 'alert' ? 'border-bc-red' : 'border-bc-amber'
              }`}
            >
              <div className={`font-mono text-xs font-bold ${
                entry.type === 'alert' ? 'text-bc-red' : 'text-bc-amber'
              }`}>
                {entry.title}
              </div>
              <div className="font-mono text-xs text-bc-muted mt-0.5">
                {new Date(entry.created_at).toLocaleString('it-IT')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
