import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useOSStore } from '@/store/useOSStore'
import { LogEntry } from '@/components/journal/LogEntry'
import { BookOpen, X } from 'lucide-react'
import type { JournalEntryType } from '@/types/journal'

const FILTER_OPTIONS: Array<{ value: JournalEntryType | 'all'; label: string }> = [
  { value: 'all',                label: 'TUTTO'         },
  { value: 'event',              label: 'EVENTI'        },
  { value: 'system',             label: 'SISTEMA'       },
  { value: 'pilot_registration', label: 'REGISTRAZIONE' },
  { value: 'mission',            label: 'MISSIONE'      },
  { value: 'pilot_note',         label: 'NOTE PILOTI'   },
]

export function JournalPanel() {
  const { isOperator, journalEntries } = useOSStore()
  const [open, setOpen]     = useState(false)
  const [filter, setFilter] = useState<JournalEntryType | 'all'>('all')
  const [rect, setRect]     = useState<DOMRect | null>(null)
  const btnRef   = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    setOpen(v => !v)
  }

  const visible  = isOperator
    ? journalEntries
    : journalEntries.filter(e => e.type !== 'pilot_note' && e.type !== 'override')
  const filtered = filter === 'all' ? visible : visible.filter(e => e.type === filter)

  const isMobile = window.innerWidth < 640

  const caretRight = rect ? window.innerWidth - rect.right + (rect.width / 2) - 6 : 20
  const caretLeft  = rect ? rect.left + (rect.width / 2) - 6 : 20

  const panelStyle: React.CSSProperties = isMobile ? {
    top: 52, left: 20, right: 20,
    maxHeight: 'calc(100dvh - 64px)',
  } : rect ? {
    top: rect.bottom + 10,
    right: window.innerWidth - rect.right,
    width: 440,
    maxHeight: `calc(100dvh - ${rect.bottom + 14}px)`,
  } : { top: 56, right: 8, width: 440, maxHeight: 'calc(100dvh - 64px)' }

  return (
    <>
      <button
        ref={btnRef}
        className={`font-mono text-xs flex items-center gap-1.5 px-3 py-1 border transition-all ${
          open ? 'border-bc-accent text-bc-accent' : 'border-[#ffffff] text-[#ffffff] hover:border-bc-accent hover:text-bc-accent'
        }`}
        onClick={handleOpen}
      >
        <BookOpen size={12} strokeWidth={1.5} />
        <span className="hidden sm:inline">ARCHIVIO</span>
      </button>

      {open && createPortal(
        <>
          {rect && (
            <div
              className="fixed"
              style={{
                zIndex: 100000,
                top: isMobile ? 44 : rect.bottom + 2,
                ...(isMobile
                  ? { left: caretLeft }
                  : { right: caretRight }),
                width: 0, height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderBottom: '8px solid var(--bc-border)',
              }}
            />
          )}
          <div
            ref={panelRef}
            className="fixed flex flex-col bg-bc-dark border border-bc-border shadow-2xl rounded-xl overflow-hidden"
            style={{ ...panelStyle, zIndex: 99999 }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-bc-border shrink-0">
              <span className="font-mono text-xs text-bc-accent tracking-widest">ARCHIVIO LOG</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-bc-muted">{visible.length} voci</span>
                <button onClick={() => setOpen(false)} className="text-bc-muted hover:text-bc-red transition-colors">
                  <X size={12} strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center border-b border-bc-border shrink-0 px-1 overflow-x-auto">
              {FILTER_OPTIONS.filter(opt => isOperator || opt.value !== 'pilot_note').map(opt => (
                <button
                  key={opt.value}
                  className={`font-mono text-[11px] sm:text-xs px-2 sm:px-2.5 py-2.5 transition-all relative whitespace-nowrap shrink-0 ${
                    filter === opt.value ? 'text-bc-text' : 'text-bc-muted hover:text-bc-text'
                  }`}
                  onClick={() => setFilter(opt.value)}
                >
                  {opt.label}
                  {filter === opt.value && (
                    <span className="absolute bottom-0 left-0 right-0 h-px bg-bc-amber shadow-[0_0_6px_var(--bc-amber)]" />
                  )}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-4">
              {filtered.length === 0
                ? <p className="font-mono text-xs text-bc-muted">NESSUNA VOCE CORRISPONDENTE</p>
                : filtered.map(entry => <LogEntry key={entry.id} entry={entry} />)
              }
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
