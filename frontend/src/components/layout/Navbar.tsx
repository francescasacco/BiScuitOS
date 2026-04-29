import { useState } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { OS_NAME } from '@/config'

const SYSTEM_KEY = import.meta.env.VITE_SYSTEM_KEY || 'BISCUIT-OVERRIDE-7734'

function AccessDeniedOverlay({ onDone }: { onDone: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-bc-black/95"
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={onDone}
    >
      {/* Red scan pulse */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(255,96,80,0.12) 0%, transparent 70%)' }} />

      <div className="font-display text-5xl md:text-6xl font-black tracking-widest text-bc-red text-glow-red animate-pulse">
        ACCESSO NEGATO
      </div>
      <div className="font-mono text-bc-red/80 text-sm tracking-widest">
        ERRORE: CHIAVE SISTEMA NON VALIDA
      </div>
      <div className="font-mono text-bc-muted text-xs">
        AUTENTICAZIONE_FALLITA // CRAWLER//OS // ACCESSO RIFIUTATO
      </div>
      <div className="mt-4 font-mono text-bc-muted/50 text-xs animate-pulse">
        [ tocca per chiudere ]
      </div>
    </div>
  )
}

export function Navbar() {
  const { isOperator, setIsOperator, sidebarOpen, setSidebarOpen } = useOSStore()
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [showDenied, setShowDenied] = useState(false)
  const now = new Date()

  const handleKeySubmit = () => {
    if (keyInput === SYSTEM_KEY) {
      setIsOperator(true)
      setShowKeyInput(false)
      setKeyInput('')
    } else {
      setShowKeyInput(false)
      setKeyInput('')
      setShowDenied(true)
      setTimeout(() => setShowDenied(false), 3000)
    }
  }

  return (
    <>
      {showDenied && <AccessDeniedOverlay onDone={() => setShowDenied(false)} />}

      <header className="h-10 bc-panel border-b border-bc-border flex items-center justify-between px-3 md:px-4 shrink-0 gap-2">
        {/* Left: hamburger + system name */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button
            className="md:hidden flex flex-col gap-1 p-1 shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Menu"
          >
            <span className="block w-4 h-px bg-bc-green" />
            <span className="block w-4 h-px bg-bc-green" />
            <span className="block w-4 h-px bg-bc-green" />
          </button>

          <span className="font-display text-xs font-bold text-bc-green tracking-widest text-glow whitespace-nowrap">
            {OS_NAME}
          </span>

          <span className="hidden sm:inline font-mono text-bc-muted text-xs whitespace-nowrap">
            {now.toLocaleDateString('it-IT', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            {' '}//&nbsp;
            <span className="animate-pulse">{now.toLocaleTimeString('it-IT', { hour12: false })}</span>
          </span>
        </div>

        {/* Right: status + operator */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 md:gap-3 font-mono text-xs text-bc-muted">
            <span className="flex items-center gap-1"><span className="status-dot nominal" />DB</span>
            <span className="flex items-center gap-1"><span className="status-dot nominal" />NET</span>
            <span className="flex items-center gap-1"><span className="status-dot warning" />SCAFO</span>
          </div>

          {showKeyInput ? (
            <div className="flex items-center gap-1 md:gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleKeySubmit()}
                placeholder="CHIAVE..."
                className="bc-input text-xs py-0.5 w-28 md:w-36"
                autoFocus
              />
              <button className="bc-btn-green text-xs px-2 py-0.5" onClick={handleKeySubmit}>OK</button>
              <button
                className="bc-btn border-bc-muted text-bc-muted text-xs px-2 py-0.5"
                onClick={() => { setShowKeyInput(false); setKeyInput('') }}
              >✕</button>
            </div>
          ) : isOperator ? (
            <span className="font-mono text-xs text-bc-amber text-glow-amber animate-pulse whitespace-nowrap">
              [ OPERATORE ]
            </span>
          ) : (
            <button
              className="bc-btn border-bc-muted text-bc-muted text-xs px-2 py-0.5 hover:border-bc-amber hover:text-bc-amber whitespace-nowrap"
              onClick={() => setShowKeyInput(true)}
            >
              <span className="hidden sm:inline">CHIAVE SISTEMA</span>
              <span className="sm:hidden">🔑</span>
            </button>
          )}
        </div>
      </header>
    </>
  )
}
