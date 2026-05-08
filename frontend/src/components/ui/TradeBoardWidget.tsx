import { useState } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { tradeBoardService } from '@/services/tradeBoardService'
import { journalService } from '@/services/journalService'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { X, ArrowLeftRight, Wrench, Archive, ChevronDown, ChevronUp } from 'lucide-react'
import type { TradeOfferType } from '@/types/tradeBoard'

const CATEGORIES = ['Sistema', 'Modulo', 'Altro'] as const
type ActiveTab = 'richiesta' | 'offerta'
type FormErrors = { pilot_name?: string; item_name?: string }

function validate(pilotName: string, itemName: string): FormErrors {
  const errors: FormErrors = {}
  if (!pilotName.trim()) errors.pilot_name = 'Seleziona un pilota.'
  if (!itemName.trim()) errors.item_name = 'Il nome del modulo/sistema è obbligatorio.'
  else if (itemName.trim().length < 2) errors.item_name = 'Troppo corto — servono almeno 2 caratteri.'
  else if (itemName.length > 80) errors.item_name = 'Hai superato il limite di 80 caratteri.'
  return errors
}

const TYPE_STYLE: Record<ActiveTab, { border: string; dot: string }> = {
  offerta:   { border: 'border-bc-green/40',  dot: 'bg-bc-green' },
  richiesta: { border: 'border-bc-accent/40', dot: 'bg-bc-accent' },
}

const CAT_COLOR: Record<string, string> = {
  Sistema: 'text-bc-blue',
  Modulo:  'text-bc-accent',
  Altro:   'text-bc-muted',
}

const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000

function OfferRow({ offer, isOperator, onDelete }: {
  offer: import('@/types/tradeBoard').TradeOffer
  isOperator: boolean
  onDelete: (id: string) => void
}) {
  const dot = offer.type === 'offerta' ? 'bg-bc-green' : offer.type === 'richiesta' ? 'bg-bc-accent' : 'bg-bc-muted/40'
  return (
    <div className="flex items-start gap-3 px-4 py-3 group">
      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-mono text-xs font-bold text-bc-text">{offer.pilot_name}</span>
          <span className={`bc-tag text-xs ${CAT_COLOR[offer.item_category] ?? 'text-bc-muted'} border-current/40`}>{offer.item_category}</span>
        </div>
        <div className="font-sans text-sm font-semibold text-bc-text">{offer.item_name}</div>
        {offer.notes && <div className="font-mono text-xs text-bc-muted mt-0.5">{offer.notes}</div>}
        <div className="font-mono text-[10px] text-bc-muted/50 mt-1">
          {new Date(offer.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </div>
      </div>
      {isOperator && (
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-bc-muted hover:text-bc-red shrink-0" onClick={() => onDelete(offer.id)}>
          <X size={12} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

export function TradeBoardWidget() {
  const { pilots, tradeOffers, addTradeOffer, removeTradeOffer, isOperator, addJournalEntry } = useOSStore()
  const [tab, setTab] = useState<ActiveTab>('richiesta')
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<ActiveTab>('offerta')
  const [pilotName, setPilotName] = useState('')
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState<'Sistema' | 'Modulo' | 'Altro'>('Sistema')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ pilot_name?: boolean; item_name?: boolean }>({})
  const [saving, setSaving] = useState(false)
  const [showArchiveRichieste, setShowArchiveRichieste] = useState(true)
  const [showArchiveOfferte, setShowArchiveOfferte] = useState(true)

  const now = Date.now()
  const active   = tradeOffers.filter(o => !o.archived && (now - new Date(o.created_at).getTime()) < FOURTEEN_DAYS)
  const archived = tradeOffers.filter(o => o.archived  || (now - new Date(o.created_at).getTime()) >= FOURTEEN_DAYS)
  const visible  = active.filter(o => o.type === tab)

  const archivedRichieste = archived.filter(o => o.type === 'richiesta')
  const archivedOfferte   = archived.filter(o => o.type === 'offerta')
  const pilotOptions = pilots.map(p => p.identificativo)
  const getMechItems = (name: string) => {
    const pilot = pilots.find(p => p.identificativo === name)
    if (!pilot) return []
    return [pilot.mech_sistemi, pilot.mech_moduli].filter(Boolean).join('\n')
      .split('\n').map(s => s.trim()).filter(Boolean)
  }
  const mechItems = getMechItems(pilotName)

  const touch = (field: keyof FormErrors) => {
    setTouched(t => ({ ...t, [field]: true }))
    setErrors(prev => ({ ...prev, [field]: validate(pilotName, itemName)[field] }))
  }

  const handleSubmit = async () => {
    const e = validate(pilotName, itemName)
    setErrors(e); setTouched({ pilot_name: true, item_name: true })
    if (Object.keys(e).length > 0) return
    setSaving(true)
    try {
      const offer = await tradeBoardService.create({ pilot_name: pilotName, type: formType, item_name: itemName, item_category: category, notes: notes.trim() || undefined })
      addTradeOffer(offer)
      const logEntry = await journalService.create({
        title: formType === 'offerta' ? `OFFERTA ATTIVA — ${itemName}!` : `CERCASI — ${itemName}!`,
        content: formType === 'offerta'
          ? `${pilotName} mette sul tavolo: ${itemName} (${category}). Chi è interessato si faccia avanti!${notes.trim() ? `\n"${notes.trim()}"` : ''}`
          : `${pilotName} è a caccia di: ${itemName} (${category}). Piloti, occhi aperti!${notes.trim() ? `\n"${notes.trim()}"` : ''}`,
        type: 'event', author: pilotName,
      })
      addJournalEntry(logEntry)
      setPilotName(''); setItemName(''); setNotes(''); setErrors({}); setTouched({})
      setShowForm(false)
    } catch (err) {
      console.error('[TRADE] Salvataggio fallito:', err)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try { await tradeBoardService.delete(id); removeTradeOffer(id) }
    catch (err) { console.error('[TRADE] Eliminazione fallita:', err) }
  }

  const openForm = (type: ActiveTab) => {
    setFormType(type); setShowForm(true)
    setPilotName(''); setItemName(''); setNotes(''); setErrors({}); setTouched({})
  }

  return (
    <div className="bg-bc-panel border border-bc-border rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-bc-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight size={13} strokeWidth={1.5} className="text-bc-accent" />
          <span className="font-mono text-xs text-bc-accent tracking-widest uppercase">Bacheca Scambi</span>
        </div>
        <div className="flex gap-2">
          <button className="font-mono text-xs px-1.5 py-0.5 border border-bc-green/50 text-bc-green hover:bg-bc-green/10 transition-colors" onClick={() => openForm('offerta')}>+ OFFERTA</button>
          <button className="font-mono text-xs px-1.5 py-0.5 border border-bc-accent/50 text-bc-accent hover:bg-bc-accent/10 transition-colors" onClick={() => openForm('richiesta')}>+ RICHIESTA</button>
        </div>
      </div>

      {showForm && (
        <div className={`px-4 py-3 border-b ${TYPE_STYLE[formType].border} bg-bc-dark/60`}>
          <p className="font-mono text-xs tracking-widest mb-3" style={{ color: formType === 'offerta' ? 'var(--bc-green)' : 'var(--bc-accent)' }}>
            // NUOVA {formType.toUpperCase()}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-xs text-bc-muted block mb-1">PILOTA *</label>
              <CustomSelect value={pilotName} onChange={v => { setPilotName(v); setItemName(''); setTouched(t => ({ ...t, pilot_name: true })); setErrors(e => ({ ...e, pilot_name: undefined })) }} options={pilotOptions} placeholder="SELEZIONA PILOTA..." hasError={!!(touched.pilot_name && errors.pilot_name)} />
              {touched.pilot_name && errors.pilot_name && <p className="font-mono text-xs text-bc-red mt-1 italic">{errors.pilot_name}</p>}
            </div>
            <div>
              <label className="font-mono text-xs text-bc-muted block mb-1">CATEGORIA</label>
              <CustomSelect value={category} onChange={v => setCategory(v as typeof category)} options={[...CATEGORIES]} />
            </div>
            <div className="sm:col-span-2">
              <label className="font-mono text-xs text-bc-muted block mb-1">{formType === 'offerta' ? 'MODULO / SISTEMA DA OFFRIRE *' : 'MODULO / SISTEMA DESIDERATO *'}</label>
              {formType === 'offerta' && mechItems.length > 0 ? (
                <CustomSelect value={itemName} onChange={v => { setItemName(v); setTouched(t => ({ ...t, item_name: true })); setErrors(e => ({ ...e, item_name: undefined })) }} options={mechItems} placeholder="SELEZIONA DAL MECH..." hasError={!!(touched.item_name && errors.item_name)} />
              ) : (
                <input className={`bc-input text-xs${touched.item_name && errors.item_name ? ' border-bc-red focus:border-bc-red' : ''}`} placeholder="es. Scudo Energetico, Modulo Radar..." value={itemName} onChange={e => { setItemName(e.target.value); if (touched.item_name) setErrors(er => ({ ...er, item_name: validate(pilotName, e.target.value).item_name })) }} onBlur={() => touch('item_name')} />
              )}
              {touched.item_name && errors.item_name && <p className="font-mono text-xs text-bc-red mt-1 italic">{errors.item_name}</p>}
              {formType === 'offerta' && pilotName && mechItems.length === 0 && <p className="font-mono text-xs text-bc-muted/60 mt-1">Nessun sistema/modulo registrato per questo pilota.</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="font-mono text-xs text-bc-muted block mb-1">NOTE <span className="text-bc-muted/50">(opzionale)</span></label>
              <input className="bc-input text-xs" placeholder={formType === 'offerta' ? 'es. disponibile da subito, in buone condizioni...' : 'es. urgente, da fabbricare, in cambio di rottami...'} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button className={`flex-1 font-mono text-xs py-1.5 border transition-all ${formType === 'offerta' ? 'border-bc-green text-bc-green hover:bg-bc-green/10' : 'border-bc-accent text-bc-accent hover:bg-bc-accent/10'}`} onClick={handleSubmit} disabled={saving}>
              {saving ? 'SALVATAGGIO...' : 'PUBBLICA'}
            </button>
            <button className="font-mono text-xs px-3 py-1.5 border border-bc-muted/30 text-bc-muted hover:border-bc-red hover:text-bc-red transition-all" onClick={() => setShowForm(false)}>ANNULLA</button>
          </div>
        </div>
      )}

      <div className="flex border-b border-bc-border">
        {(['richiesta', 'offerta'] as ActiveTab[]).map(t => (
          <button key={t} className={`flex-1 font-mono text-xs py-2.5 relative transition-colors ${tab === t ? 'text-bc-text' : 'text-bc-muted hover:text-bc-text'}`} onClick={() => setTab(t)}>
            <span className="flex items-center justify-center gap-1.5">
              {t === 'offerta' ? <ArrowLeftRight size={11} strokeWidth={1.5} /> : <Wrench size={11} strokeWidth={1.5} />}
              {t.toUpperCase()}
              <span className="font-mono text-[10px] text-bc-muted">({active.filter(o => o.type === t).length})</span>
            </span>
            {tab === t && <span className="absolute bottom-0 left-0 right-0 h-px bg-bc-amber shadow-[0_0_6px_var(--bc-amber)]" />}
          </button>
        ))}
      </div>

      <div className="divide-y divide-bc-border/50">
        {visible.length === 0
          ? <p className="font-mono text-xs text-bc-muted px-4 py-6 text-center">{tab === 'offerta' ? 'Nessuna offerta attiva.' : 'Nessuna richiesta attiva.'}</p>
          : visible.map(offer => <OfferRow key={offer.id} offer={offer} isOperator={isOperator} onDelete={handleDelete} />)
        }
      </div>

      <div className="border-t border-bc-border/50">
        <div className="grid grid-cols-2 divide-x divide-bc-border/50">
          <div>
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-bc-muted hover:text-bc-text transition-colors border-b border-bc-border/30" onClick={() => setShowArchiveRichieste(v => !v)}>
              <span className="flex items-center gap-1.5 font-mono text-xs">
                <Archive size={11} strokeWidth={1.5} />
                ARCHIVIO RICHIESTE
                <span className="text-[10px]">({archivedRichieste.length})</span>
              </span>
              {showArchiveRichieste ? <ChevronUp size={11} strokeWidth={2} /> : <ChevronDown size={11} strokeWidth={2} />}
            </button>
            {showArchiveRichieste && (
              <div className="divide-y divide-bc-border/30 opacity-60">
                {archivedRichieste.length === 0
                  ? <p className="font-mono text-xs text-bc-muted/50 px-3 py-3 text-center">Nessuna.</p>
                  : archivedRichieste.map(offer => <OfferRow key={offer.id} offer={offer} isOperator={isOperator} onDelete={handleDelete} />)
                }
              </div>
            )}
          </div>
          <div>
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-bc-muted hover:text-bc-text transition-colors border-b border-bc-border/30" onClick={() => setShowArchiveOfferte(v => !v)}>
              <span className="flex items-center gap-1.5 font-mono text-xs">
                <Archive size={11} strokeWidth={1.5} />
                ARCHIVIO OFFERTE
                <span className="text-[10px]">({archivedOfferte.length})</span>
              </span>
              {showArchiveOfferte ? <ChevronUp size={11} strokeWidth={2} /> : <ChevronDown size={11} strokeWidth={2} />}
            </button>
            {showArchiveOfferte && (
              <div className="divide-y divide-bc-border/30 opacity-60">
                {archivedOfferte.length === 0
                  ? <p className="font-mono text-xs text-bc-muted/50 px-3 py-3 text-center">Nessuna.</p>
                  : archivedOfferte.map(offer => <OfferRow key={offer.id} offer={offer} isOperator={isOperator} onDelete={handleDelete} />)
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
