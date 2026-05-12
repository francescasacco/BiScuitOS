import { useState } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { X, ChevronLeft, Plus, UserPen, Key } from 'lucide-react'
import { PilotCard } from '@/components/crew/PilotCard'
import { PilotForm } from '@/components/crew/PilotForm'
import { PilotSelfEdit } from '@/components/crew/PilotSelfEdit'
import type { Pilot } from '@/types/pilot'
import type { JournalEntry } from '@/types/journal'

const splitMechItems = (str: string): string[] => {
  if (str.includes('\n')) return str.split('\n').filter(Boolean)
  return str.split(',').map((s) => s.trim()).filter(Boolean)
}

export function CrewInterface() {
  const pilots = useOSStore((s) => s.pilots)
  const journalEntries = useOSStore((s) => s.journalEntries)
  const isOperator = useOSStore((s) => s.isOperator)
  const [showForm, setShowForm] = useState(false)
  const [showSelfEdit, setShowSelfEdit] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = selectedId ? (pilots.find((p) => p.id === selectedId) ?? null) : null
  const handleSelect = (pilot: Pilot) => setSelectedId(pilot.id)
  const pilotCards = pilots.map((p) => {
    const isSelected = selected !== null && selected.id === p.id
    return <PilotCard key={p.id} pilot={p} onSelect={handleSelect} selected={isSelected} />
  })

  return (
    <div className="h-full flex flex-col overflow-hidden p-3">

      {showSelfEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(9,9,14,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSelfEdit(false) }}
        >
          <div className="w-full max-w-lg bg-bc-panel border border-bc-border rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-bc-border bg-gradient-to-r from-bc-accent/10 to-transparent gap-3">
              <div>
                <div className="font-mono text-[10px] text-bc-accent/50 uppercase tracking-widest mb-0.5">REGISTRO PILOTI</div>
                <span className="font-display text-sm font-bold text-bc-accent tracking-wider">AGGIORNA I TUOI DATI</span>
              </div>
              <button className="text-bc-text/70 hover:text-bc-red transition-colors shrink-0 mt-0.5 p-1" onClick={() => setShowSelfEdit(false)}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="p-6">
              <PilotSelfEdit onClose={() => setShowSelfEdit(false)} />
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(9,9,14,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}
        >
          <div className="w-full max-w-lg bg-bc-panel border border-bc-border rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-bc-border bg-gradient-to-r from-bc-green/10 to-transparent gap-3">
              <div>
                <div className="font-mono text-[10px] text-bc-green/50 uppercase tracking-widest mb-0.5">REGISTRO PILOTI</div>
                <span className="font-display text-sm font-bold text-bc-green tracking-wider">INSERZIONE NUOVO PILOTA</span>
              </div>
              <button className="text-bc-text/70 hover:text-bc-red transition-colors shrink-0 mt-0.5 p-1" onClick={() => setShowForm(false)}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="p-6">
              <PilotForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-0 animate-boot-in">
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-bc-border pb-3">
          <div>
            <h1 className="font-display text-lg font-bold text-bc-green text-glow tracking-widest">
              NODO EQUIPAGGIO //<span className="inline sm:hidden"><br/></span> REGISTRO PILOTI
            </h1>
            <p className="font-mono text-[13px] text-bc-muted mt-0.5">
              {pilots.length === 0
                ? 'Nessun nodo registrato nel sistema'
                : pilots.length === 1
                  ? '1 nodo attivo registrato nel sistema'
                  : `${pilots.length} nodi attivi registrati nel sistema`}
            </p>
          </div>
          <div className="flex flex-row gap-2 self-center sm:self-auto">
            <button
              className="bc-btn bc-btn-accent flex items-center gap-1.5"
              onClick={() => setShowSelfEdit(true)}
            >
              <UserPen size={12} strokeWidth={2} /> AGGIORNA DATI PILOTA
            </button>
            <button
              className="bc-btn bc-btn-green flex items-center gap-1.5"
              onClick={() => { setShowForm(true); setSelectedId(null) }}
            >
              <Plus size={12} strokeWidth={2.5} /> REGISTRA PILOTA
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mt-3">
        {selected ? (
          <div className={`bc-panel border overflow-hidden ${
            selected.sesso === 'F' ? 'border-bc-rose/40 border-glow-rose' : 'border-bc-green/40 border-glow'
          }`}>
            <div className={`px-6 py-3 border-b border-bc-border bg-gradient-to-r ${
              selected.sesso === 'F' ? 'from-bc-rose/10' : 'from-bc-green/10'
            } to-transparent flex items-center justify-between`}>
              <div className="flex items-center gap-3 min-w-0 flex-wrap">
                <h2 className={`font-display text-sm font-bold ${
                  selected.sesso === 'F' ? 'text-bc-rose text-glow-rose' : 'text-bc-green text-glow'
                }`}>
                  {selected.identificativo}
                </h2>
                {selected.access_key && isOperator && (
                  <div className="flex items-center gap-2 border border-bc-amber/30 bg-bc-amber/5 px-2.5 py-1 rounded">
                    <Key size={10} strokeWidth={2} className="text-bc-amber/50 shrink-0" />
                    <span className="font-mono text-[9px] text-bc-amber/50 uppercase tracking-widest">chiave modifica</span>
                    <span className="font-mono text-[13px] text-bc-amber tracking-widest">{selected.access_key}</span>
                  </div>
                )}
              </div>
              <button
                className="bc-btn bc-btn-back text-xs flex items-center gap-1 shrink-0"
                onClick={() => setSelectedId(null)}
              >
                <ChevronLeft size={13} /> INDIETRO
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="bc-section-header">// DATI PILOTA</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 items-start">
                  {[
                    ['IDENTIFICATIVO', selected.identificativo],
                    ['CLASSE', selected.classe],
                    ['SESSO', selected.sesso === 'M' ? 'Maschio' : selected.sesso === 'F' ? 'Femmina' : undefined],
                    ['MOTTO', selected.motto_attivato],
                    ['CIMELIO', selected.cimelio],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label}>
                      <div className="font-mono text-bc-muted text-xs">{label}</div>
                      <div className={`font-mono text-[13px] ${
                        selected.sesso === 'F' ? 'text-bc-rose' : 'text-bc-green'
                      }`}>{value}</div>
                    </div>
                  ))}
                  {selected.aspetto && (
                    <div>
                      <div className="font-mono text-bc-muted text-xs">ASPETTO</div>
                      <div className={`font-mono text-[13px] leading-relaxed ${
                        selected.sesso === 'F' ? 'text-bc-rose/80' : 'text-bc-green/80'
                      }`}>{selected.aspetto}</div>
                    </div>
                  )}
                  {selected.background && (
                    <div>
                      <div className="font-mono text-bc-muted text-xs">BACKGROUND</div>
                      <div className={`font-mono text-[13px] leading-relaxed ${
                        selected.sesso === 'F' ? 'text-bc-rose/80' : 'text-bc-green/80'
                      }`}>{selected.background}</div>
                    </div>
                  )}
                  {selected.abilita && (
                    <div className="md:col-start-1">
                      <div className="font-mono text-bc-muted text-xs mb-1">ABILITÀ</div>
                      <div className="space-y-1">
                        {splitMechItems(selected.abilita).map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              selected.sesso === 'F' ? 'bg-bc-rose/50' : 'bg-bc-green/50'
                            }`} />
                            <span className={`font-mono text-[13px] ${
                              selected.sesso === 'F' ? 'text-bc-rose' : 'text-bc-green'
                            }`}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.equipaggiamento && (
                    <div className="md:col-start-2">
                      <div className="font-mono text-bc-muted text-xs mb-1">EQUIPAGGIAMENTO</div>
                      <div className="space-y-1">
                        {splitMechItems(selected.equipaggiamento).map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              selected.sesso === 'F' ? 'bg-bc-rose/50' : 'bg-bc-green/50'
                            }`} />
                            <span className={`font-mono text-[13px] ${
                              selected.sesso === 'F' ? 'text-bc-rose' : 'text-bc-green'
                            }`}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="bc-section-header">// UNITÀ MECH</div>
                {(selected.mech_telaio || selected.mech_modello || selected.mech_nome) ? (
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-3">
                        {selected.mech_telaio && (
                          <div>
                            <div className="font-mono text-bc-muted text-xs">TELAIO</div>
                            <div className="font-mono text-[13px] text-bc-blue capitalize">{selected.mech_telaio}</div>
                          </div>
                        )}
                        {selected.mech_nome && (
                          <div>
                            <div className="font-mono text-bc-muted text-xs">NOME</div>
                            <div className="font-mono text-[13px] text-bc-blue capitalize">{selected.mech_nome}</div>
                          </div>
                        )}
                        {selected.mech_sistemi && (
                          <div>
                            <div className="font-mono text-bc-muted text-xs mb-1">SISTEMI</div>
                            <div className="space-y-1">
                              {splitMechItems(selected.mech_sistemi).map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-bc-blue/50 shrink-0" />
                                  <span className="font-mono text-[13px] text-bc-blue">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        {selected.mech_modello && (
                          <div>
                            <div className="font-mono text-bc-muted text-xs">MODELLO</div>
                            <div className="font-mono text-[13px] text-bc-blue capitalize">{selected.mech_modello}</div>
                          </div>
                        )}
                        {selected.mech_status && (
                          <div>
                            <div className="font-mono text-bc-muted text-xs">STATO</div>
                            <div className="font-mono text-[13px] text-bc-blue capitalize">{selected.mech_status}</div>
                          </div>
                        )}
                        {selected.mech_moduli && (
                          <div>
                            <div className="font-mono text-bc-muted text-xs mb-1">MODULI</div>
                            <div className="space-y-1">
                              {splitMechItems(selected.mech_moduli).map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-bc-blue/50 shrink-0" />
                                  <span className="font-mono text-[13px] text-bc-blue">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {selected.mech_info && (
                      <div>
                        <div className="font-mono text-bc-muted text-xs">NOTE</div>
                        <div className="font-mono text-[13px] text-bc-blue leading-relaxed">{selected.mech_info}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-mono text-bc-muted text-xs">NESSUN MECH ASSEGNATO</p>
                )}
              </div>
            </div>

            {isOperator && (() => {
              const notes = journalEntries.filter(
                (e): e is JournalEntry => e.type === 'pilot_note' &&
                  e.title === `NOTA OPERATORE // ${selected.identificativo}`
              )
              if (notes.length === 0) return null
              return (
                <div className="mt-6 pt-4 border-t border-bc-border">
                  <div className="bc-section-header">// NOTE</div>
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="border-l-2 border-bc-amber/50 pl-3 py-1">
                        <div className="font-mono text-[13px] text-bc-muted/60 mb-1">
                          {new Date(note.created_at).toLocaleString('it-IT', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', hour12: false,
                          })}
                          {note.author && <span className="ml-2">// {note.author}</span>}
                        </div>
                        <div className="font-mono text-[13px] text-bc-amber/80 leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pilots.length === 0 ? (
              <div className="col-span-2 bc-panel border border-bc-border p-8 text-center">
                <p className="font-mono text-bc-muted text-sm">NESSUN PILOTA REGISTRATO</p>
                <p className="font-mono text-bc-muted/60 text-xs mt-2">Nodo equipaggio del sistema vuoto</p>
              </div>
            ) : pilotCards}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
