import { useState } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { pilotService } from '@/services/pilotService'
import { journalService } from '@/services/journalService'
import type { Pilot } from '@/types/pilot'
import { CLASSI_PILOTA } from '@/types/pilot'
import { validateField } from '@/components/crew/pilotFormValidation'
import type { PilotFormData } from '@/types/pilot'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { CoreLabel, CoreCancelBtn, CoreFieldError, CorePilotField } from './CoreField'
import { Check, Users } from 'lucide-react'
import { MechItemList } from '@/components/crew/MechItemList'

type ActionType = 'edit' | 'note' | 'delete'
type Action = { type: ActionType; pilotId: string } | null

const PILOT_BTN = {
  edit:   { active: 'border-bc-accent text-bc-accent bg-bc-accent/10',   hover: 'hover:border-bc-accent hover:text-bc-accent',   label: 'MODIFICA' },
  note:   { active: 'border-bc-amber text-bc-amber bg-bc-amber/10',      hover: 'hover:border-bc-amber hover:text-bc-amber',     label: 'NOTA'     },
  delete: { active: 'border-bc-red text-bc-red bg-bc-red/10',            hover: 'hover:border-bc-red hover:text-bc-red',         label: 'ELIMINA'  },
}

export function PilotManagement() {
  const { pilots, updatePilot, removePilot, addJournalEntry } = useOSStore()
  const [active, setActive]     = useState<Action>(null)
  const [editForm, setEditForm] = useState<Partial<Pilot>>({})
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof PilotFormData, string>>>({})
  const [editTouched, setEditTouched] = useState<Partial<Record<keyof PilotFormData, boolean>>>({})
  const [noteText, setNoteText] = useState('')
  const [loading, setLoading]   = useState(false)
  const [flash, setFlash]       = useState<string | null>(null)

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(null), 2500) }
  const is = (type: ActionType, id: string) => active?.type === type && active.pilotId === id
  const open = (type: ActionType, pilot: Pilot) => {
    if (is(type, pilot.id)) { setActive(null); return }
    setActive({ type, pilotId: pilot.id })
    if (type === 'edit') { setEditForm({ ...pilot }); setEditErrors({}); setEditTouched({}) }
    if (type === 'note') setNoteText('')
  }
  const ef = (key: keyof Pilot) => (v: string) => {
    setEditForm(f => ({ ...f, [key]: v }))
    if (editTouched[key as keyof PilotFormData]) {
      setEditErrors(e => ({ ...e, [key]: validateField(key as keyof PilotFormData, v) }))
    }
  }
  const touchEf = (key: keyof PilotFormData) => () => {
    setEditTouched(t => ({ ...t, [key]: true }))
    setEditErrors(e => ({ ...e, [key]: validateField(key, String(editForm[key as keyof Pilot] ?? '')) }))
  }
  const validateEdit = (): boolean => {
    const fields: (keyof PilotFormData)[] = ['identificativo', 'classe']
    const newErrors: Partial<Record<keyof PilotFormData, string>> = {}
    const newTouched: Partial<Record<keyof PilotFormData, boolean>> = { ...editTouched }
    let valid = true
    for (const f of fields) {
      newTouched[f] = true
      const err = validateField(f, String(editForm[f as keyof Pilot] ?? ''))
      newErrors[f] = err
      if (err) valid = false
    }
    setEditTouched(newTouched)
    setEditErrors(e => ({ ...e, ...newErrors }))
    return valid
  }

  const handleUpdate = async (pilot: Pilot) => {
    if (!validateEdit()) return
    setLoading(true)
    try {
      updatePilot(await pilotService.update(pilot.id, editForm))
      setActive(null)
      showFlash(`${pilot.identificativo} AGGIORNATO`)
    } catch (err) { console.error('[CRAWLER//OS] Update pilota fallito:', err) }
    finally { setLoading(false) }
  }

  const handleDelete = async (pilot: Pilot) => {
    setLoading(true)
    try {
      await pilotService.delete(pilot.id)
      removePilot(pilot.id)
      setActive(null)
      showFlash(`${pilot.identificativo} RIMOSSO DAL REGISTRO`)
    } catch (err) { console.error('[CRAWLER//OS] Delete pilota fallito:', err) }
    finally { setLoading(false) }
  }

  const handleNote = async (pilot: Pilot) => {
    if (!noteText.trim()) return
    setLoading(true)
    try {
      addJournalEntry(await journalService.create({
        title: `NOTA OPERATORE // ${pilot.identificativo}`,
        content: noteText, type: 'pilot_note', author: 'OPERATORE SISTEMA',
      }))
      setNoteText(''); setActive(null)
      showFlash('NOTA REGISTRATA NEL LOG')
    } catch (err) { console.error('[CRAWLER//OS] Nota pilota fallita:', err) }
    finally { setLoading(false) }
  }

  return (
    <div className="bc-panel border border-bc-accent/30 h-full flex flex-col">
      <div className="bc-section-header px-4 pt-4 shrink-0 flex items-center gap-1.5"><Users size={12} strokeWidth={2} /> GESTIONE REGISTRO PILOTI</div>

      {flash && (
        <div className="mx-4 mb-2 font-mono text-xs text-bc-green border border-bc-green/30 px-3 py-2 shrink-0 flex items-center gap-1.5">
          <Check size={11} strokeWidth={2.5} /> {flash}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {pilots.length === 0 ? (
          <p className="font-mono text-xs text-bc-muted">NESSUN PILOTA NEL REGISTRO</p>
        ) : (
          <div className="space-y-2">
            {(pilots as Pilot[]).map((pilot) => (
              <div key={pilot.id} className={`border rounded-lg overflow-hidden ${
                pilot.sesso === 'F' ? 'border-bc-rose/50' : 'border-bc-border'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2.5 bg-bc-dark">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`font-mono text-sm font-bold truncate ${
                      pilot.sesso === 'F' ? 'text-bc-rose' : 'text-bc-green'
                    }`}>{pilot.identificativo}</span>
                    <span className="font-mono text-xs text-bc-muted shrink-0">{pilot.classe}</span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {(['edit', 'note', 'delete'] as ActionType[]).map(type => (
                      <button key={type} onClick={() => open(type, pilot)}
                        className={`font-mono text-xs px-2 py-0.5 border transition-all ${
                          is(type, pilot.id)
                            ? PILOT_BTN[type].active
                            : `border-bc-muted/30 text-bc-muted ${PILOT_BTN[type].hover}`
                        }`}>
                        {PILOT_BTN[type].label}
                      </button>
                    ))}
                  </div>
                </div>

                {is('edit', pilot.id) && (
                  <div className="px-3 py-3 border-t border-bc-border space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <CoreLabel>IDENTIFICATIVO</CoreLabel>
                        <input
                          className={`bc-input border-bc-accent/40 text-bc-text focus:border-bc-accent text-xs${
                            editErrors.identificativo ? ' border-bc-red focus:border-bc-red' : ''
                          }`}
                          value={String(editForm.identificativo ?? '')}
                          onChange={e => ef('identificativo')(e.target.value)}
                          onBlur={touchEf('identificativo')}
                        />
                        <CoreFieldError msg={editErrors.identificativo} />
                      </div>
                      <div>
                        <CoreLabel>CLASSE</CoreLabel>
                        <CustomSelect
                          value={String(editForm.classe ?? '')}
                          onChange={v => { ef('classe')(v); setEditTouched(t => ({ ...t, classe: true })); setEditErrors(e => ({ ...e, classe: '' })) }}
                          options={CLASSI_PILOTA}
                          hasError={!!(editTouched.classe && editErrors.classe)}
                        />
                        <CoreFieldError msg={editTouched.classe ? editErrors.classe : undefined} />
                      </div>
                      <CorePilotField label="MOTTO"   value={String(editForm.motto_attivato ?? '')} onChange={ef('motto_attivato')} error={editTouched.motto_attivato ? editErrors.motto_attivato : undefined} onBlur={touchEf('motto_attivato')} />
                      <div>
                        <CoreLabel>SESSO</CoreLabel>
                        <CustomSelect
                          value={String(editForm.sesso ?? '')}
                          onChange={v => setEditForm(f => ({ ...f, sesso: v as 'M' | 'F' }))}
                          options={['M', 'F'] as const}
                          placeholder="SELEZIONA..."
                          getLabel={(v) => v === 'M' ? 'Maschio' : 'Femmina'}
                        />
                      </div>
                      <CorePilotField label="CIMELIO"    value={String(editForm.cimelio ?? '')}        onChange={ef('cimelio')}        error={editTouched.cimelio ? editErrors.cimelio : undefined}               onBlur={touchEf('cimelio')} />
                      <CorePilotField label="ASPETTO"    value={String(editForm.aspetto ?? '')}         onChange={ef('aspetto')}        error={editTouched.aspetto ? editErrors.aspetto : undefined}               onBlur={touchEf('aspetto')} />
                      <CorePilotField label="BACKGROUND" value={String(editForm.background ?? '')}      onChange={ef('background')}     error={editTouched.background ? editErrors.background : undefined}         onBlur={touchEf('background')} />
                      <CorePilotField label="TELAIO"     value={String(editForm.mech_telaio ?? '')}     onChange={ef('mech_telaio')}    error={editTouched.mech_telaio ? editErrors.mech_telaio : undefined}       onBlur={touchEf('mech_telaio')} />
                      <CorePilotField label="MODELLO"    value={String(editForm.mech_modello ?? '')}    onChange={ef('mech_modello')}   error={editTouched.mech_modello ? editErrors.mech_modello : undefined}     onBlur={touchEf('mech_modello')} />
                      <CorePilotField label="NOME MECH"  value={String(editForm.mech_nome ?? '')}       onChange={ef('mech_nome')}      error={editTouched.mech_nome ? editErrors.mech_nome : undefined}           onBlur={touchEf('mech_nome')} />
                      <CorePilotField label="STATO MECH" value={String(editForm.mech_status ?? '')}     onChange={ef('mech_status')} />
                      <CorePilotField label="SISTEMI"    value={String(editForm.mech_sistemi ?? '')}    onChange={ef('mech_sistemi')} />
                      <CorePilotField label="MODULI"     value={String(editForm.mech_moduli ?? '')}     onChange={ef('mech_moduli')} />
                      <div className="sm:col-span-2">
                        <CorePilotField label="NOTE" value={String(editForm.mech_info ?? '')} onChange={ef('mech_info')} error={editTouched.mech_info ? editErrors.mech_info : undefined} onBlur={touchEf('mech_info')} />
                      </div>
                      <div className="sm:col-span-2">
                        <CoreLabel>ABILITÀ</CoreLabel>
                        <MechItemList
                          items={(editForm.abilita ?? '').split('\n').filter(Boolean)}
                          onChange={items => setEditForm(f => ({ ...f, abilita: items.join('\n') }))}
                          placeholder="es. Hacking, Primo soccorso..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button className="bc-btn-green flex-1 text-xs py-1" onClick={() => handleUpdate(pilot)} disabled={loading}>
                        {loading ? 'SALVATAGGIO...' : 'SALVA MODIFICHE'}
                      </button>
                      <CoreCancelBtn onClick={() => setActive(null)} />
                    </div>
                  </div>
                )}

                {is('note', pilot.id) && (
                  <div className="px-3 py-3 border-t border-bc-border space-y-2">
                    <CoreLabel>NOTA OPERATORE — verrà registrata nel log di sistema</CoreLabel>
                    <textarea rows={3} className="bc-textarea border-bc-amber/40 text-bc-amber focus:border-bc-amber text-xs"
                      placeholder="INSERISCI NOTA..." value={noteText} onChange={e => setNoteText(e.target.value)} />
                    <div className="flex gap-2">
                      <button className="bc-btn-amber flex-1 text-xs py-1" onClick={() => handleNote(pilot)} disabled={loading || !noteText.trim()}>
                        {loading ? 'REGISTRAZIONE...' : 'REGISTRA NOTA'}
                      </button>
                      <CoreCancelBtn onClick={() => setActive(null)} />
                    </div>
                  </div>
                )}

                {is('delete', pilot.id) && (
                  <div className="px-3 py-3 border-t border-bc-red/30 space-y-2 bg-bc-red/5">
                    <p className="font-mono text-xs text-bc-red">
                      ATTENZIONE: <span className="font-bold">{pilot.identificativo}</span> verrà rimosso permanentemente dal registro. Operazione irreversibile.
                    </p>
                    <div className="flex gap-2">
                      <button className="bc-btn-red flex-1 text-xs py-1" onClick={() => handleDelete(pilot)} disabled={loading}>
                        {loading ? 'ELIMINAZIONE...' : 'CONFERMA ELIMINAZIONE'}
                      </button>
                      <CoreCancelBtn onClick={() => setActive(null)} />
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
