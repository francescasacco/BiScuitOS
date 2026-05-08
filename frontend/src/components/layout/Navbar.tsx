import { useState } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { OS_NAME } from '@/config'
import { BiscuitLoader } from '@/components/core/BiscuitLoader'
import { AccessDeniedOverlay } from '@/components/ui/AccessDeniedOverlay'
import { JournalPanel } from '@/components/journal/JournalPanel'
import { Menu, X, Key, ChevronLeft } from 'lucide-react'

const SYSTEM_KEY = import.meta.env.VITE_SYSTEM_KEY

export function Navbar() {
  const { isOperator, setIsOperator, sidebarOpen, setSidebarOpen } = useOSStore()
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keyInput, setKeyInput]         = useState('')
  const [showDenied, setShowDenied]     = useState(false)
  const [showLoader, setShowLoader]     = useState(false)
  const now = new Date()

  const handleKeySubmit = () => {
    if (keyInput === SYSTEM_KEY) {
      setShowKeyInput(false); setKeyInput(''); setShowLoader(true)
    } else {
      setShowKeyInput(false); setKeyInput(''); setShowDenied(true)
      setTimeout(() => setShowDenied(false), 3000)
    }
  }

  return (
    <>
      {showDenied && <AccessDeniedOverlay onDone={() => setShowDenied(false)} />}
      {showLoader && <BiscuitLoader onComplete={() => { setShowLoader(false); setIsOperator(true) }} />}

      <header className="shrink-0 border-b border-bc-border bg-bc-black/60" style={{ backdropFilter: 'blur(12px)' }}>
        <div className="h-12 flex items-center justify-between px-4 md:px-5 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              className="md:hidden inline-flex items-center justify-center text-bc-accent border border-bc-border w-8 h-8 hover:border-bc-accent transition-all shrink-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Menu"
            >
              {sidebarOpen ? <ChevronLeft size={16} strokeWidth={2} /> : <Menu size={16} strokeWidth={2} />}
            </button>

            <span className="font-display text-sm font-bold tracking-widest text-bc-text whitespace-nowrap">
              {OS_NAME}
            </span>

            <span className="hidden sm:inline font-mono text-bc-muted text-xs whitespace-nowrap">
              {now.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
              <span className="ml-1 animate-pulse">{now.toLocaleTimeString('it-IT', { hour12: false })}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <span className="status-dot nominal" />
              <span className="font-sans text-bc-green text-xs font-medium">Online</span>
            </div>

            <div className="hidden sm:block">
              <JournalPanel />
            </div>

            {isOperator ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-bc-amber border border-bc-amber/40 px-3 py-1 whitespace-nowrap animate-pulse">
                  [ BISCUIT ]
                </span>
                <button className="font-mono text-xs text-bc-muted border border-bc-muted/30 px-2 py-1 hover:border-bc-red hover:text-bc-red transition-all"
                  onClick={() => setIsOperator(false)}>
                  ESCI
                </button>
              </div>
            ) : showKeyInput ? (
              <div className="hidden md:flex items-center gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleKeySubmit()}
                  placeholder="INSERISCI CHIAVE..."
                  className="bc-input font-mono text-xs py-1 w-40 tracking-widest"
                  autoFocus
                />
                <button className="bc-btn-green font-mono text-xs px-3 py-1 tracking-widest shrink-0" onClick={handleKeySubmit}>
                  OK
                </button>
                <button className="font-mono text-xs text-bc-muted border border-bc-muted/30 px-2 py-1 hover:border-bc-red hover:text-bc-red transition-all flex items-center shrink-0"
                  onClick={() => { setShowKeyInput(false); setKeyInput('') }}>
                  <X size={11} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button
                className="font-mono text-xs uppercase tracking-widest text-bc-text/80 border border-bc-border hover:border-bc-accent hover:text-bc-accent transition-all flex items-center gap-1.5 px-3 py-1"
                onClick={() => setShowKeyInput(s => !s)}
              >
                <Key size={12} strokeWidth={1.5} />
                <span className="hidden sm:inline">CHIAVE SISTEMA</span>
              </button>
            )}
          </div>
        </div>

        {showKeyInput && !isOperator && (
          <div className="flex items-center gap-2 px-4 md:px-5 pb-2 md:hidden">
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleKeySubmit()}
              placeholder="INSERISCI CHIAVE..."
              className="bc-input font-mono text-xs py-1 flex-1 tracking-widest"
              autoFocus
            />
            <button className="bc-btn-green font-mono text-xs px-3 py-1 tracking-widest shrink-0" onClick={handleKeySubmit}>
              OK
            </button>
            <button className="font-mono text-xs text-bc-muted border border-bc-muted/30 px-2 py-1 hover:border-bc-red hover:text-bc-red transition-all flex items-center shrink-0"
              onClick={() => { setShowKeyInput(false); setKeyInput('') }}>
              <X size={11} strokeWidth={2} />
            </button>
          </div>
        )}
      </header>
    </>
  )
}
