import { useState } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { pilotService } from '@/services/pilotService'
import { journalService } from '@/services/journalService'
import type { Pilot } from '@/types/pilot'
import { CLASSI_PILOTA } from '@/types/pilot'
import { CustomSelect } from '@/components/ui/CustomSelect'

type Action = { type: 'edit' | 'note' | 'delete'; pilotId: string } | null

export function PilotManagement() {
  const { pilots, updatePilot, removePilot, addJournalEntry } = useOSStore()
  const [active, setActive]     = useState<Action>(null)
  const [editForm, setEditForm] = useState<Partial<Pilot>>({})
  const [noteText, setNoteText] = useState('')
  const [loading, setLoading]   = useState(false)
  const [flash, setFlash]       = useState<string | null>(null)

  const showFlash = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(null), 2500)
  }

  const is = (type: NonNullable<Action>['type'], id: string) =>
    active?.type === type && active.pilotId === id

  const open = (type: NonNullable<Action>['type'], pilot: Pilot) => {
    if (is(type, pilot.id)) { setActive(null); return }
    setActive({ type, pilotId: pilot.id })
    if (type === 'edit') setEditForm({ ...pilot })
    if (type === 'note') setNoteText('')
  }

  const handleUpdate = async (pilot: Pilot) => {
    setLoading(true)
    try {
      const updated = await pilotService.update(pilot.id, editForm)
      updatePilot(updated)
      setActive(null)
      showFlash(`${pilot.identificativo} AGGIORNATO`)
    } catch (err) {
      console.error('[CRAWLER//OS] Update pilota fallito:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (pilot: Pilot) => {
    setLoading(true)
    try {
      await pilotService.delete(pilot.id)
      removePilot(pilot.id)
      setActive(null)
      showFlash(`${pilot.identificativo} RIMOSSO DAL REGISTRO`)
    } catch (err) {
      console.error('[CRAWLER//OS] Delete pilota fallito:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNote = async (pilot: Pilot) => {
    if (!noteText.trim()) return
    setLoading(true)
    try {
      const entry = await journalService.create({
        title: `NOTA OPERATORE // ${pilot.identificativo}`,
        content: noteText,
        type: 'pilot_note',
        author: 'OPERATORE SISTEMA',
      })
      addJournalEntry(entry)
      setNoteText('')
      setActive(null)
      showFlash('NOTA REGISTRATA NEL LOG')
    } catch (err) {
      console.error('[CRAWLER//OS] Nota pilota fallita:', err)
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof Pilot) => (
    <input
      className="bc-input border-bc-accent/40 text-bc-text focus:border-bc-accent text-xs"
      value={String(editForm[key] ?? '')}
      onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
    />
  )

  const textarea = (key: keyof Pilot) => (
    <textarea
      rows={2}
      className="bc-textarea border-bc-accent/40 text-bc-text focus:border-bc-accent text-xs"
      value={String(editForm[key] ?? '')}
      onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
    />
  )

  return (
    <div className="bc-panel border border-bc-accent/30 h-full flex flex-col">
      <div className="bc-section-header px-4 pt-4 shrink-0">◉ // GESTIONE REGISTRO PILOTI</div>

      {flash && (
        <div className="mx-4 mb-2 font-mono text-xs text-bc-green border border-bc-green/30 px-3 py-2 shrink-0">
          ✓ {flash}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-4">

      {pilots.length === 0 ? (
        <p className="font-mono text-xs text-bc-muted">NESSUN PILOTA NEL REGISTRO</p>
      ) : (
        <div className="space-y-2">
          {(pilots as Pilot[]).map((pilot) => (
            <div key={pilot.id} className="border border-bc-border rounded-lg overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2.5 bg-bc-dark">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-sm font-bold text-bc-green truncate">{pilot.identificativo}</span>
                  <span className="font-mono text-xs text-bc-muted shrink-0">{pilot.classe}</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => open('edit', pilot)}
                    className={`font-mono text-xs px-2 py-0.5 border transition-all ${is('edit', pilot.id) ? 'border-bc-accent text-bc-accent bg-bc-accent/10' : 'border-bc-muted/30 text-bc-muted hover:border-bc-accent hover:text-bc-accent'}`}
                  >
                    MODIFICA
                  </button>
                  <button
                    onClick={() => open('note', pilot)}
                    className={`font-mono text-xs px-2 py-0.5 border transition-all ${is('note', pilot.id) ? 'border-bc-amber text-bc-amber bg-bc-amber/10' : 'border-bc-muted/30 text-bc-muted hover:border-bc-amber hover:text-bc-amber'}`}
                  >
                    NOTA
                  </button>
                  <button
                    onClick={() => open('delete', pilot)}
                    className={`font-mono text-xs px-2 py-0.5 border transition-all ${is('delete', pilot.id) ? 'border-bc-red text-bc-red bg-bc-red/10' : 'border-bc-muted/30 text-bc-muted hover:border-bc-red hover:text-bc-red'}`}
                  >
                    ELIMINA
                  </button>
                </div>
              </div>

              {is('edit', pilot.id) && (
                <div className="px-3 py-3 border-t border-bc-border space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">IDENTIFICATIVO</label>
                      {field('identificativo')}
                    </div>
                    <div>
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">CLASSE</label>
                      <CustomSelect
                        value={String(editForm.classe ?? '')}
                        onChange={(v) => setEditForm((f) => ({ ...f, classe: v }))}
                        options={CLASSI_PILOTA}
                      />
                    </div>
                    <div>
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">MOTTO</label>
                      {field('motto_attivato')}
                    </div>
                    <div>
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">CIMELIO</label>
                      {field('cimelio')}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">ASPETTO</label>
                      {textarea('aspetto')}
                    </div>
                    <div>
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">BACKGROUND</label>
                      {textarea('background')}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">TELAIO</label>
                      {field('mech_telaio')}
                    </div>
                    <div>
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">MODELLO</label>
                      {field('mech_modello')}
                    </div>
                    <div>
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">NOME MECH</label>
                      {field('mech_nome')}
                    </div>
                    <div>
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">STATO MECH</label>
                      {field('mech_status')}
                    </div>
                    <div>
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">SISTEMI</label>
                      {field('mech_sistemi')}
                    </div>
                    <div>
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">MODULI</label>
                      {field('mech_moduli')}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-mono text-xs text-bc-accent/70 block mb-1">NOTE</label>
                      {field('mech_info')}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      className="bc-btn-green flex-1 text-xs py-1"
                      onClick={() => handleUpdate(pilot)}
                      disabled={loading}
                    >
                      {loading ? 'SALVATAGGIO...' : 'SALVA MODIFICHE'}
                    </button>
                    <button
                      className="font-mono text-xs px-3 py-1 border border-bc-muted/30 text-bc-muted hover:border-bc-text hover:text-bc-text transition-all"
                      onClick={() => setActive(null)}
                    >
                      ANNULLA
                    </button>
                  </div>
                </div>
              )}

              {is('note', pilot.id) && (
                <div className="px-3 py-3 border-t border-bc-border space-y-2">
                  <label className="font-mono text-xs text-bc-amber/70 block">
                    NOTA OPERATORE — verrà registrata nel log di sistema
                  </label>
                  <textarea
                    rows={3}
                    className="bc-textarea border-bc-amber/40 text-bc-amber focus:border-bc-amber text-xs"
                    placeholder="INSERISCI NOTA..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      className="bc-btn-amber flex-1 text-xs py-1"
                      onClick={() => handleNote(pilot)}
                      disabled={loading || !noteText.trim()}
                    >
                      {loading ? 'REGISTRAZIONE...' : 'REGISTRA NOTA'}
                    </button>
                    <button
                      className="font-mono text-xs px-3 py-1 border border-bc-muted/30 text-bc-muted hover:border-bc-text hover:text-bc-text transition-all"
                      onClick={() => setActive(null)}
                    >
                      ANNULLA
                    </button>
                  </div>
                </div>
              )}

              {is('delete', pilot.id) && (
                <div className="px-3 py-3 border-t border-bc-red/30 space-y-2 bg-bc-red/5">
                  <p className="font-mono text-xs text-bc-red">
                    ATTENZIONE: <span className="font-bold">{pilot.identificativo}</span> verrà rimosso permanentemente dal registro. Operazione irreversibile.
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="bc-btn-red flex-1 text-xs py-1"
                      onClick={() => handleDelete(pilot)}
                      disabled={loading}
                    >
                      {loading ? 'ELIMINAZIONE...' : 'CONFERMA ELIMINAZIONE'}
                    </button>
                    <button
                      className="font-mono text-xs px-3 py-1 border border-bc-muted/30 text-bc-muted hover:border-bc-text hover:text-bc-text transition-all"
                      onClick={() => setActive(null)}
                    >
                      ANNULLA
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
