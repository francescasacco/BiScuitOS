import { useState } from 'react'
import { journalService } from '@/services/journalService'
import { useOSStore } from '@/store/useOSStore'
import type { JournalEntryType } from '@/types/journal'
import { CustomSelect } from '@/components/ui/CustomSelect'

const EVENT_TYPES: JournalEntryType[] = ['event', 'system', 'override']

const TYPE_LABELS: Record<JournalEntryType, string> = {
  event: 'EVENTO',
  system: 'SISTEMA',
  alert: 'ALERT',
  override: 'OVERRIDE',
  mission: 'MISSIONE',
  pilot_registration: 'REGISTRAZIONE',
  pilot_note: 'NOTA PILOTA',
}

export function SystemCommandInput() {
  const { addJournalEntry } = useOSStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<JournalEntryType>('event')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleInject = async () => {
    if (!title.trim() || !content.trim()) return
    setLoading(true)
    try {
      const entry = await journalService.create({
        title,
        content,
        type,
        author: 'OPERATORE SISTEMA',
      })
      addJournalEntry(entry)
      setTitle('')
      setContent('')
      setSent(true)
      setTimeout(() => setSent(false), 2000)
    } catch (err) {
      console.error('[CRAWLER//OS] Iniezione evento fallita:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bc-panel border border-bc-amber/40 p-3 h-full flex flex-col">
      <div className="bc-section-header" style={{ color: 'var(--bc-amber)' }}>
        // CONSOLE INIEZIONE EVENTI
      </div>

      <div className="flex items-end gap-3 mb-2">
        <div className="flex-1">
          <label className="font-mono text-xs text-bc-amber/70 block mb-1">TITOLO</label>
          <input
            className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
            placeholder="TITOLO EVENTO..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="w-36 shrink-0">
          <label className="font-mono text-xs text-bc-amber/70 block mb-1">TIPO</label>
          <CustomSelect
            value={type}
            onChange={(v) => setType(v as JournalEntryType)}
            options={EVENT_TYPES}
            getLabel={(v) => TYPE_LABELS[v as JournalEntryType]}
          />
        </div>
      </div>

      <div className="mb-2 flex-1 flex flex-col">
        <label className="font-mono text-xs text-bc-amber/70 block mb-1">CONTENUTO</label>
        <textarea
          className="bc-textarea border-bc-amber/40 text-bc-amber focus:border-bc-amber flex-1 resize-none"
          placeholder="Descrizione evento, log narrativo..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <button
        className="bc-btn-amber w-full py-2"
        onClick={handleInject}
        disabled={loading || !title.trim() || !content.trim()}
      >
        {loading ? 'INIEZIONE...' : sent ? '✓ EVENTO INVIATO' : 'INIETTA EVENTO'}
      </button>
    </div>
  )
}
