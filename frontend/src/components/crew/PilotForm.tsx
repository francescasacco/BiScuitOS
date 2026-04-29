import { useState } from 'react'
import type { PilotFormData } from '@/types/pilot'
import { CLASSI_PILOTA } from '@/types/pilot'
import { pilotService } from '@/services/pilotService'
import { useOSStore } from '@/store/useOSStore'

const EMPTY_FORM: PilotFormData = {
  identificativo: '',
  classe: '',
  aspetto: '',
  background: '',
  cimelio: '',
  mech_nome: '',
  mech_info: '',
  mech_sistemi: '',
  mech_moduli: '',
  mech_status: 'OPERATIONAL',
  motto_attivato: '',
}

const STEPS = ['IDENTITÀ', 'PROFILO', 'MECH', 'CONFERMA']

interface PilotFormProps {
  onClose: () => void
}

export function PilotForm({ onClose }: PilotFormProps) {
  const addPilot = useOSStore((s) => s.addPilot)
  const addJournalEntry = useOSStore((s) => s.addJournalEntry)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<PilotFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [registering, setRegistering] = useState(false)

  const update = (field: keyof PilotFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    setRegistering(true)
    try {
      const pilot = await pilotService.create(form)
      addPilot(pilot)
      addJournalEntry({
        id: crypto.randomUUID(),
        title: `REGISTRAZIONE_PILOTA // ${form.identificativo}`,
        content: `Nuovo nodo pilota iniettato nella rete.`,
        type: 'pilot_registration',
        author: 'SISTEMA',
        created_at: new Date().toISOString(),
      })
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      console.error('[CRAWLER//OS] Registrazione pilota fallita:', err)
      setRegistering(false)
    } finally {
      setLoading(false)
    }
  }

  if (registering && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3 font-mono text-sm">
        <div className="text-bc-green text-glow animate-pulse">▶ Registrazione pilota nel nodo sistema...</div>
        <div className="text-bc-green">▶ Sincronizzazione con il database Crawler...</div>
        <div className="text-bc-green">▶ Evento REGISTRAZIONE_PILOTA inviato.</div>
        <div className="text-bc-amber mt-4">Sincronizzazione nodo completata.</div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 font-mono text-xs">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`${
              i === step ? 'text-bc-green text-glow' :
              i < step ? 'text-bc-green/40' : 'text-bc-muted'
            }`}>
              {i < step ? '✓' : `${i + 1}`}. {s}
            </span>
            {i < STEPS.length - 1 && <span className="text-bc-border">—</span>}
          </div>
        ))}
      </div>

      {/* Step 0: Identity */}
      {step === 0 && (
        <div className="space-y-4 animate-boot-in">
          <div className="bc-section-header">// IDENTITÀ PILOTA</div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">IDENTIFICATIVO *</label>
            <input
              className="bc-input"
              placeholder="es. IRON-7, Ghost, Mantis..."
              value={form.identificativo}
              onChange={(e) => update('identificativo', e.target.value)}
            />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">CLASSE *</label>
            <select
              className="bc-select"
              value={form.classe}
              onChange={(e) => update('classe', e.target.value)}
            >
              <option value="">SELEZIONA CLASSE...</option>
              {CLASSI_PILOTA.map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">MOTTO ATTIVATO</label>
            <input
              className="bc-input"
              placeholder="La frase del tuo pilota..."
              value={form.motto_attivato ?? ''}
              onChange={(e) => update('motto_attivato', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 1: Profile */}
      {step === 1 && (
        <div className="space-y-4 animate-boot-in">
          <div className="bc-section-header">// PROFILO PILOTA</div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">ASPETTO</label>
            <textarea
              className="bc-textarea"
              rows={3}
              placeholder="Descrivi l'aspetto fisico del pilota..."
              value={form.aspetto ?? ''}
              onChange={(e) => update('aspetto', e.target.value)}
            />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">BACKGROUND</label>
            <textarea
              className="bc-textarea"
              rows={3}
              placeholder="Storia del pilota, da dove viene..."
              value={form.background ?? ''}
              onChange={(e) => update('background', e.target.value)}
            />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">CIMELIO</label>
            <input
              className="bc-input"
              placeholder="Oggetto personale importante..."
              value={form.cimelio ?? ''}
              onChange={(e) => update('cimelio', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 2: Mech */}
      {step === 2 && (
        <div className="space-y-4 animate-boot-in">
          <div className="bc-section-header">// REGISTRAZIONE UNITÀ MECH</div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">NOME MECH</label>
            <input
              className="bc-input"
              placeholder="Designazione dell'unità..."
              value={form.mech_nome ?? ''}
              onChange={(e) => update('mech_nome', e.target.value)}
            />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">INFO MECH</label>
            <textarea
              className="bc-textarea"
              rows={2}
              placeholder="Descrizione, modello, storia..."
              value={form.mech_info ?? ''}
              onChange={(e) => update('mech_info', e.target.value)}
            />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">SISTEMI</label>
            <textarea
              className="bc-textarea"
              rows={2}
              placeholder="Sistemi installati (es: radar, scudo)..."
              value={form.mech_sistemi ?? ''}
              onChange={(e) => update('mech_sistemi', e.target.value)}
            />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">MODULI</label>
            <textarea
              className="bc-textarea"
              rows={2}
              placeholder="Moduli aggiuntivi montati..."
              value={form.mech_moduli ?? ''}
              onChange={(e) => update('mech_moduli', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="space-y-4 animate-boot-in">
          <div className="bc-section-header">// CONFERMA // REGISTRAZIONE PILOTA</div>
          <div className="bc-panel border border-bc-border p-4 font-mono text-xs space-y-2">
            <div className="text-bc-muted">IDENTIFICATIVO: <span className="text-bc-green">{form.identificativo}</span></div>
            <div className="text-bc-muted">CLASSE: <span className="text-bc-green">{form.classe}</span></div>
            {form.mech_nome && (
              <div className="text-bc-muted">MECH: <span className="text-bc-blue">{form.mech_nome}</span></div>
            )}
            <div className="mt-3 pt-3 border-t border-bc-border text-bc-amber">
              ⚠ CONFERMA INIEZIONE PILOTA NELLA RETE?
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          className="bc-btn border-bc-muted text-bc-muted"
          onClick={step === 0 ? onClose : () => setStep(step - 1)}
        >
          {step === 0 ? 'ANNULLA' : '← INDIETRO'}
        </button>
        <button
          className={step === STEPS.length - 1 ? 'bc-btn-amber' : 'bc-btn-green'}
          onClick={step === STEPS.length - 1 ? handleSubmit : () => setStep(step + 1)}
          disabled={loading || (step === 0 && (!form.identificativo || !form.classe))}
        >
          {step === STEPS.length - 1 ? (loading ? 'INIEZIONE...' : 'CONFERMA REGISTRAZIONE') : 'AVANTI →'}
        </button>
      </div>
    </div>
  )
}
