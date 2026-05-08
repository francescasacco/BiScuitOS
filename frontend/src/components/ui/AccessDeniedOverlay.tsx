import { OS_NAME } from '@/config'

interface AccessDeniedOverlayProps {
  onDone?: () => void
  subtitle?: string
  detail?: string
}

export function AccessDeniedOverlay({ onDone, subtitle, detail }: AccessDeniedOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6"
      style={{ background: 'var(--bc-black)', backdropFilter: 'blur(4px)' }}
      onClick={onDone}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(248,113,113,0.12) 0%, transparent 70%)' }}
      />
      <p className="font-mono text-xs tracking-[0.3em]" style={{ color: 'var(--bc-muted)' }}>
        {subtitle ?? `SISTEMA CORE // ${OS_NAME}`}
      </p>
      <h1
        className="font-display text-3xl sm:text-5xl font-black tracking-wide sm:tracking-widest animate-pulse px-4 text-center"
        style={{ color: 'var(--bc-red)', textShadow: '0 0 24px var(--bc-red)' }}
      >
        ACCESSO NEGATO
      </h1>
      <p className="font-mono text-sm px-6 text-center max-w-sm" style={{ color: 'rgba(248,113,113,0.8)' }}>
        {detail ?? 'ERRORE: CHIAVE SISTEMA NON VALIDA'}
      </p>
      <div className="flex flex-col items-center gap-1 font-mono text-xs px-6" style={{ color: 'var(--bc-muted)', opacity: 0.5 }}>
        <span>AUTENTICAZIONE_FALLITA</span>
        <span>{OS_NAME}</span>
        <span>ACCESSO RIFIUTATO</span>
      </div>
      {onDone && (
        <p className="font-mono text-xs animate-pulse mt-2" style={{ color: 'var(--bc-muted)', opacity: 0.5 }}>
          [ TOCCA PER CHIUDERE ]
        </p>
      )}
    </div>
  )
}
