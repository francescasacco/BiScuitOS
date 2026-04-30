import type { JournalEntry, JournalEntryType } from '@/types/journal'

const TYPE_STYLES: Record<JournalEntryType, { border: string; label: string; color: string; dot: string }> = {
  event:              { border: 'border-bc-green', label: 'EVENTO',         color: 'text-bc-green', dot: 'bg-bc-accent' },
  mission:            { border: 'border-bc-blue',  label: 'MISSIONE',       color: 'text-bc-blue',  dot: 'bg-bc-green' },
  system:             { border: 'border-bc-muted', label: 'SISTEMA',        color: 'text-bc-muted', dot: 'bg-bc-muted' },
  pilot_registration: { border: 'border-bc-green', label: 'REGISTRAZIONE',  color: 'text-bc-green', dot: 'bg-bc-green' },
  override:           { border: 'border-bc-amber', label: 'OVERRIDE',       color: 'text-bc-amber', dot: 'bg-bc-amber' },
  alert:              { border: 'border-bc-red',   label: 'ALERT',          color: 'text-bc-red',   dot: 'bg-bc-red' },
  narrative:          { border: 'border-bc-blue',  label: 'NARRATIVA',      color: 'text-bc-blue',  dot: 'bg-bc-blue' },
}

export function LogEntry({ entry }: { entry: JournalEntry }) {
  const style = TYPE_STYLES[entry.type ?? 'event'] ?? TYPE_STYLES.event

  return (
    <div className={`border-l-2 pl-4 py-2 ${style.border}`}>
      <div className="flex items-center gap-3 mb-1">
        <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
        <span className={`bc-tag ${style.border} ${style.color} text-xs`}>{style.label}</span>
        <span className="font-mono text-bc-muted text-xs">
          {new Date(entry.created_at).toLocaleString('it-IT', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false,
          })}
        </span>
        {entry.author && (
          <span className="font-mono text-bc-muted/60 text-xs">// {entry.author}</span>
        )}
      </div>
      <div className={`font-mono text-sm font-bold ${style.color}`}>{entry.title}</div>
      <div className="font-mono text-xs text-bc-muted mt-1 whitespace-pre-wrap leading-relaxed">
        {entry.content}
      </div>
    </div>
  )
}
