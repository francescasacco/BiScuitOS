import { useOSStore } from '@/store/useOSStore'
import { LogEntry } from '@/components/journal/LogEntry'
import { useState } from 'react'
import type { JournalEntryType } from '@/types/journal'

const FILTER_OPTIONS: Array<{ value: JournalEntryType | 'all'; label: string }> = [
  { value: 'all', label: 'TUTTO' },
  { value: 'event', label: 'EVENTI' },
  { value: 'system', label: 'SISTEMA' },
  { value: 'pilot_registration', label: 'REGISTRAZIONE' },
  { value: 'mission', label: 'MISSIONE' },
  { value: 'alert', label: 'ALERT' },
  { value: 'narrative', label: 'NARRATIVA' },
  { value: 'override', label: 'OVERRIDE' },
  { value: 'pilot_note', label: 'NOTE PILOTI' },
]

export function JournalInterface() {
  const { journalEntries, isOperator } = useOSStore()
  const [filter, setFilter] = useState<JournalEntryType | 'all'>('all')

  const visible = isOperator ? journalEntries : journalEntries.filter((e) => e.type !== 'pilot_note')
  const filtered = filter === 'all'
    ? visible
    : visible.filter((e) => e.type === filter)

  return (
    <div className="h-full overflow-y-auto p-3"><div className="space-y-3 animate-boot-in">
      <div className="border-b border-bc-border pb-3">
        <h1 className="font-display text-lg font-bold text-bc-green text-glow tracking-widest">
          FLUSSO JOURNAL // ARCHIVIO LOG
        </h1>
        <p className="font-mono text-xs text-bc-muted mt-0.5">
          {visible.length} voci registrate in memoria
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.filter((opt) => isOperator || opt.value !== 'pilot_note').map((opt) => (
          <button
            key={opt.value}
            className={`bc-btn text-xs px-2 py-1 ${
              filter === opt.value
                ? 'border-bc-green text-bc-green'
                : 'border-bc-border text-bc-muted'
            }`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bc-panel border border-bc-border p-4 space-y-5">
        {filtered.length === 0 ? (
          <p className="font-mono text-bc-muted text-xs">NESSUNA VOCE CORRISPONDENTE AL FILTRO</p>
        ) : (
          filtered.map((entry) => (
            <LogEntry key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div></div>
  )
}
