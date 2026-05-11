export function StatChip({ label, value, accent }: { label: string; value: string; accent: string }) {
  const parts = value.split('·').map(s => s.trim())
  return (
    <div className="bg-bc-panel border border-bc-border rounded-xl px-3 py-2.5 flex flex-col items-center sm:items-start justify-center sm:justify-start text-center sm:text-left">
      <div className="font-sans text-bc-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</div>
      {parts.length > 1 ? (
        <div className={`font-mono text-lg font-bold ${accent}`}>
          <span className="hidden sm:inline">{value}</span>
          <span className="sm:hidden flex flex-col leading-tight">
            {parts.map((p, i) => <span key={i}>{p}</span>)}
          </span>
        </div>
      ) : (
        <div className={`font-mono text-lg font-bold ${accent}`}>{value}</div>
      )}
    </div>
  )
}

export function CombinedBarChip({
  psCurrent, psMax, potCurrent, potMax,
}: { psCurrent?: number; psMax?: number; potCurrent?: number; potMax?: number }) {
  const psPct  = psMax  ? Math.min(100, ((psCurrent  ?? 0) / psMax)  * 100) : 0
  const potPct = potMax ? Math.min(100, ((potCurrent ?? 0) / potMax) * 100) : 0
  return (
    <div className="col-span-3 sm:col-span-2 bg-bc-panel border border-bc-border rounded-xl px-3 py-2.5 flex flex-col justify-center gap-2.5">
      <div>
        <div className="flex justify-between font-mono text-xs mb-1">
          <span className="text-bc-muted text-xs uppercase tracking-wider">Punti Struttura</span>
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

export function Ticker({ text, colorClass }: { text: string; colorClass: string }) {
  const doubled = `${text}      ${text}      `
  return (
    <div className="bc-ticker">
      <span className={`bc-ticker-inner font-sans text-sm font-semibold ${colorClass}`}>{doubled}</span>
    </div>
  )
}
