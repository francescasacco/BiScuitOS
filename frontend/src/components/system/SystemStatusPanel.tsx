import { useOSStore } from '@/store/useOSStore'

export function SystemStatusPanel() {
  const { crawlerSystem } = useOSStore()
  const sys = crawlerSystem

  const repairLevel =
    sys?.repair_status === 'NOMINALE'    ? 'nominal' :
    sys?.repair_status === 'DANNEGGIATO' ? 'warning' : 'critical'

  return (
    <div className="bc-panel border border-bc-border p-3 border-glow">
      <div className="bc-section-header">STATO CRAWLER</div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="font-mono text-bc-muted text-xs mb-1">STATO RIPARAZIONE</div>
          <div className={`font-mono text-sm font-bold ${
            repairLevel === 'nominal' ? 'text-bc-green' :
            repairLevel === 'warning' ? 'text-bc-amber' : 'text-bc-red'
          }`}>
            {sys?.repair_status ?? 'SCONOSCIUTO'}
          </div>
        </div>
        <div>
          <div className="font-mono text-bc-muted text-xs mb-1">PONTE MERCANTE</div>
          <div className="font-mono text-sm text-bc-green">
            {sys?.merchant_bridge?.length
              ? `${sys.merchant_bridge.length} oggett${sys.merchant_bridge.length === 1 ? 'o' : 'i'}`
              : '—'}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="font-mono text-bc-muted text-xs mb-1">ALERT ATTIVI</div>
        <div className={`font-mono text-xs ${
          sys?.active_alerts && sys.active_alerts !== 'NONE'
            ? 'text-bc-amber' : 'text-bc-muted'
        }`}>
          {sys?.active_alerts ?? 'NESSUN DATO'}
        </div>
      </div>

      {sys?.system_notes && (
        <div className="mt-4 border-t border-bc-border pt-4">
          <div className="font-mono text-bc-muted text-xs mb-1">NOTE DI SISTEMA</div>
          <div className="font-mono text-xs text-bc-green/70 leading-relaxed whitespace-pre-wrap">
            {sys.system_notes}
          </div>
        </div>
      )}
    </div>
  )
}
