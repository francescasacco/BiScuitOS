import { useState, useRef } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { pilotService } from '@/services/pilotService'
import { MechItemList } from '@/components/crew/MechItemList'
import { ChevronLeft, Check } from 'lucide-react'
import type { Pilot } from '@/types/pilot'

interface PilotSelfEditProps {
  onClose: () => void
}

type EditStep = 'auth' | 'edit' | 'done'

export function PilotSelfEdit({ onClose }: PilotSelfEditProps) {
  const { pilots, updatePilot } = useOSStore()
  const [step, setStep] = useState<EditStep>('auth')
  const [identificativo, setIdentificativo] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [authError, setAuthError] = useState('')
  const [pilotId, setPilotId] = useState<string>('')
  const [form, setForm] = useState<Partial<Pilot>>({})
  const [sistemiList, setSistemiList] = useState<string[]>([])
  const [moduliList, setModuliList] = useState<string[]>([])
  const [abilitaList, setAbilitaList] = useState<string[]>([])
  const pendingAbilita = useRef('')
  const pendingSistemi = useRef('')
  const pendingModuli = useRef('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleAuth = () => {
    const found = pilots.find(
      p => p.identificativo.toLowerCase() === identificativo.trim().toLowerCase()
        && p.access_key === accessKey.trim().toUpperCase()
    )
    if (!found) {
      setAuthError('Identificativo o chiave non validi.')
      return
    }
    setPilotId(found.id)
    const { id, created_at, updated_at, role, abilita, mech_sistemi, mech_moduli, ...rest } = found as Pilot
    setForm(rest)
    setSistemiList(mech_sistemi?.split('\n').filter(Boolean) ?? [])
    setModuliList(mech_moduli?.split('\n').filter(Boolean) ?? [])
    setAbilitaList(abilita?.split('\n').filter(Boolean) ?? [])
    setAuthError('')
    setStep('edit')
  }

  const handleSave = async () => {
    if (!pilotId) return
    setSaving(true)
    setSaveError('')
    // flush input pendenti non confermati con +
    const finalAbilita = pendingAbilita.current.trim()
      ? [...abilitaList, pendingAbilita.current.trim()]
      : abilitaList
    const finalSistemi = pendingSistemi.current.trim()
      ? [...sistemiList, pendingSistemi.current.trim()]
      : sistemiList
    const finalModuli = pendingModuli.current.trim()
      ? [...moduliList, pendingModuli.current.trim()]
      : moduliList
    try {
      const payload = {
        ...form,
        abilita: finalAbilita.join('\n'),
        mech_sistemi: finalSistemi.join('\n'),
        mech_moduli: finalModuli.join('\n'),
      }
      const updated = await pilotService.update(pilotId, payload)
      if (!updated) throw new Error('Nessun dato restituito dal server.')
      updatePilot(updated)
      setStep('done')
      setTimeout(() => onClose(), 2000)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const inp = 'bc-input text-sm'
  const ta = 'bc-textarea text-sm'

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3 font-mono text-sm">
        <Check size={24} strokeWidth={2} className="text-bc-green" />
        <p className="text-bc-green">Dati aggiornati con successo.</p>
      </div>
    )
  }

  if (step === 'auth') {
    return (
      <div className="space-y-4">
        <div className="bc-section-header">// ACCESSO MODIFICA DATI</div>
        <p className="font-mono text-xs text-bc-muted">Inserisci il tuo identificativo e la chiave personale ricevuta alla registrazione.</p>
        <div>
          <label className="font-mono text-xs text-bc-muted block mb-1">IDENTIFICATIVO</label>
          <input className={inp} placeholder="es. Ghost, Mantis..." value={identificativo}
            onChange={e => setIdentificativo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()} />
        </div>
        <div>
          <label className="font-mono text-xs text-bc-muted block mb-1">CHIAVE PERSONALE</label>
          <input className={inp} placeholder="es. AB3X7K" value={accessKey}
            onChange={e => setAccessKey(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleAuth()} />
        </div>
        {authError && <p className="font-mono text-xs text-bc-red italic">{authError}</p>}
        <div className="flex gap-2 pt-2">
          <button className="bc-btn-green flex-1" onClick={handleAuth}>ACCEDI</button>
          <button className="bc-btn border-bc-muted text-bc-muted" onClick={onClose}>ANNULLA</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="bc-section-header !mb-0 !pb-0 !border-0">// MODIFICA DATI — {form.identificativo}</div>
        <button className="bc-btn border-bc-muted text-bc-muted text-xs flex items-center gap-1" onClick={() => setStep('auth')}>
          <ChevronLeft size={12} /> INDIETRO
        </button>
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[10px] text-bc-accent/60 uppercase tracking-widest">// PROFILO</p>
        <div>
          <label className="font-mono text-xs text-bc-muted block mb-1">MOTTO</label>
          <input className={inp} value={form.motto_attivato ?? ''} onChange={e => setForm(f => ({ ...f, motto_attivato: e.target.value }))} />
        </div>
        <div>
          <label className="font-mono text-xs text-bc-muted block mb-1">ASPETTO</label>
          <textarea className={ta} rows={2} value={form.aspetto ?? ''} onChange={e => setForm(f => ({ ...f, aspetto: e.target.value }))} />
        </div>
        <div>
          <label className="font-mono text-xs text-bc-muted block mb-1">BACKGROUND</label>
          <textarea className={ta} rows={2} value={form.background ?? ''} onChange={e => setForm(f => ({ ...f, background: e.target.value }))} />
        </div>
        <div>
          <label className="font-mono text-xs text-bc-muted block mb-1">CIMELIO</label>
          <input className={inp} value={form.cimelio ?? ''} onChange={e => setForm(f => ({ ...f, cimelio: e.target.value }))} />
        </div>
        <div>
          <label className="font-mono text-xs text-bc-muted block mb-1">ABILITÀ</label>
          <MechItemList items={abilitaList} onChange={setAbilitaList} placeholder="es. Hacking, Primo soccorso..." pendingRef={pendingAbilita} />
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-bc-border">
        <p className="font-mono text-[10px] text-bc-accent/60 uppercase tracking-widest pt-2">// UNITÀ MECH</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">NOME MECH</label>
            <input className={inp} value={form.mech_nome ?? ''} onChange={e => setForm(f => ({ ...f, mech_nome: e.target.value }))} />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">STATO</label>
            <input className={inp} value={form.mech_status ?? ''} onChange={e => setForm(f => ({ ...f, mech_status: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="font-mono text-xs text-bc-muted block mb-1">SISTEMI</label>
          <MechItemList items={sistemiList} onChange={setSistemiList} placeholder="es. Radar..." pendingRef={pendingSistemi} />
        </div>
        <div>
          <label className="font-mono text-xs text-bc-muted block mb-1">MODULI</label>
          <MechItemList items={moduliList} onChange={setModuliList} placeholder="es. Modulo comunicazioni..." pendingRef={pendingModuli} />
        </div>
        <div>
          <label className="font-mono text-xs text-bc-muted block mb-1">NOTE MECH</label>
          <textarea className={ta} rows={2} value={form.mech_info ?? ''} onChange={e => setForm(f => ({ ...f, mech_info: e.target.value }))} />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button className="bc-btn-green flex-1" onClick={handleSave} disabled={saving}>
          {saving ? 'SALVATAGGIO...' : 'SALVA MODIFICHE'}
        </button>
        <button className="bc-btn border-bc-muted text-bc-muted" onClick={onClose}>ANNULLA</button>
      </div>
      {saveError && <p className="font-mono text-xs text-bc-red italic">{saveError}</p>}
    </div>
  )
}
