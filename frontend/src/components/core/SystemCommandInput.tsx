import { useState } from 'react'
import { journalService } from '@/services/journalService'
import { useOSStore } from '@/store/useOSStore'
import type { JournalEntryType } from '@/types/journal'

const EVENT_TYPES: JournalEntryType[] = ['event', 'system', 'alert', 'narrative', 'override']

const TYPE_LABELS: Record<JournalEntryType, string> = {
  event: 'EVENTO',
  system: 'SISTEMA',
  alert: 'ALERT',
  narrative: 'NARRATIVA',
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
    <div className="bc-panel border border-bc-amber/40 p-4">
      <div className="bc-section-header" style={{ color: 'var(--bc-amber)' }}>
        // CONSOLE INIEZIONE EVENTI
      </div>

      <div className="mb-3">
        <label className="font-mono text-xs text-bc-amber/70 block mb-1">TIPO EVENTO</label>
        <select
          className="bc-select border-bc-amber/40 text-bc-amber"
          value={type}
          onChange={(e) => setType(e.target.value as JournalEntryType)}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="font-mono text-xs text-bc-amber/70 block mb-1">TITOLO</label>
        <input
          className="bc-input border-bc-amber/40 text-bc-amber focus:border-bc-amber"
          placeholder="TITOLO EVENTO..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="font-mono text-xs text-bc-amber/70 block mb-1">CONTENUTO</label>
        <textarea
          className="bc-textarea border-bc-amber/40 text-bc-amber focus:border-bc-amber"
          rows={4}
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
