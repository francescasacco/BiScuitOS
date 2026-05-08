import { useState } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { X } from 'lucide-react'

const splitMechItems = (str: string): string[] => {
  if (str.includes('\n')) return str.split('\n').filter(Boolean)
  return str.split(',').map((s) => s.trim()).filter(Boolean)
}
import { PilotCard } from '@/components/crew/PilotCard'
import { PilotForm } from '@/components/crew/PilotForm'
import type { Pilot } from '@/types/pilot'

export function CrewInterface() {
  const { pilots, journalEntries, isOperator } = useOSStore()
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Pilot | null>(null)

  return (
    <div className="h-full overflow-y-auto p-3">

      {/* Modal inserzione pilota */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(9,9,14,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}
        >
          <div className="w-full max-w-lg bg-bc-panel border border-bc-border rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-bc-border">
              <span className="font-mono text-xs text-bc-accent/70 uppercase tracking-widest">
                // INSERZIONE NUOVO PILOTA
              </span>
              <button className="font-mono text-xs text-bc-muted hover:text-bc-red transition-colors px-1" onClick={() => setShowForm(false)}>
                <X size={12} strokeWidth={2} />
              </button>
            </div>
            <div className="p-6">
              <PilotForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 animate-boot-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-bc-border pb-3">
          <div>
            <h1 className="font-display text-lg font-bold text-bc-green text-glow tracking-widest">
              NODO EQUIPAGGIO // REGISTRO PILOTI
            </h1>
            <p className="font-mono text-xs text-bc-muted mt-0.5">
              {pilots.length} nodo/i attivo/i registrato/i nel sistema
            </p>
          </div>
          <button
            className="bc-btn-green self-start sm:self-auto"
            onClick={() => { setShowForm(true); setSelected(null) }}
          >
            + REGISTRA PILOTA
          </button>
        </div>

        {selected ? (
          <div className={`bc-panel border p-6 ${
            selected.sesso === 'F' ? 'border-bc-rose/40 border-glow-rose' : 'border-bc-green/40 border-glow'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-display text-sm font-bold ${
                selected.sesso === 'F' ? 'text-bc-rose text-glow-rose' : 'text-bc-green text-glow'
              }`}>
                {selected.identificativo}
              </h2>
              <button
                className="bc-btn border-bc-muted text-bc-muted text-xs"
                onClick={() => setSelected(null)}
              >
                ← INDIETRO
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="bc-section-header">// DATI PILOTA</div>
                {[
                  ['IDENTIFICATIVO', selected.identificativo],
                  ['CLASSE', selected.classe],
                  ['SESSO', selected.sesso === 'M' ? 'Maschio' : selected.sesso === 'F' ? 'Femmina' : undefined],
                  ['MOTTO', selected.motto_attivato],
                  ['CIMELIO', selected.cimelio],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label}>
                    <div className="font-mono text-bc-muted text-xs">{label}</div>
                    <div className={`font-mono text-sm ${
                      selected.sesso === 'F' ? 'text-bc-rose' : 'text-bc-green'
                    }`}>{value}</div>
                  </div>
                ))}
                {selected.aspetto && (
                  <div>
                    <div className="font-mono text-bc-muted text-xs">ASPETTO</div>
                    <div className={`font-mono text-sm leading-relaxed ${
                      selected.sesso === 'F' ? 'text-bc-rose/80' : 'text-bc-green/80'
                    }`}>{selected.aspetto}</div>
                  </div>
                )}
                {selected.background && (
                  <div>
                    <div className="font-mono text-bc-muted text-xs">BACKGROUND</div>
                    <div className={`font-mono text-sm leading-relaxed ${
                      selected.sesso === 'F' ? 'text-bc-rose/80' : 'text-bc-green/80'
                    }`}>{selected.background}</div>
                  </div>
                )}
                {selected.abilita && (
                  <div>
                    <div className="font-mono text-bc-muted text-xs mb-1">ABILITÀ</div>
                    <div className="space-y-1">
                      {splitMechItems(selected.abilita).map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            selected.sesso === 'F' ? 'bg-bc-rose/50' : 'bg-bc-green/50'
                          }`} />
                          <span className={`font-mono text-sm ${
                            selected.sesso === 'F' ? 'text-bc-rose' : 'text-bc-green'
                          }`}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="bc-section-header">// UNITÀ MECH</div>
                {(selected.mech_telaio || selected.mech_modello || selected.mech_nome) ? (
                  <>
                    {[
                      ['TELAIO', selected.mech_telaio],
                      ['MODELLO', selected.mech_modello],
                      ['NOME', selected.mech_nome],
                      ['STATO', selected.mech_status],
                      ['NOTE', selected.mech_info],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label}>
                        <div className="font-mono text-bc-muted text-xs">{label}</div>
                        <div className="font-mono text-sm text-bc-blue leading-relaxed capitalize">{value}</div>
                      </div>
                    ))}
                    {selected.mech_sistemi && (
                      <div>
                        <div className="font-mono text-bc-muted text-xs mb-1">SISTEMI</div>
                        <div className="space-y-1">
                          {splitMechItems(selected.mech_sistemi).map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-bc-blue/50 shrink-0" />
                              <span className="font-mono text-sm text-bc-blue">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selected.mech_moduli && (
                      <div>
                        <div className="font-mono text-bc-muted text-xs mb-1">MODULI</div>
                        <div className="space-y-1">
                          {splitMechItems(selected.mech_moduli).map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-bc-blue/50 shrink-0" />
                              <span className="font-mono text-sm text-bc-blue">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="font-mono text-bc-muted text-xs">NESSUN MECH ASSEGNATO</p>
                )}
              </div>
            </div>

            {isOperator && (() => {
              const notes = journalEntries.filter(
                (e) => e.type === 'pilot_note' &&
                  e.title === `NOTA OPERATORE // ${(selected as Pilot).identificativo}`
              )
              if (notes.length === 0) return null
              return (
                <div className="mt-6 pt-4 border-t border-bc-border">
                  <div className="bc-section-header">// NOTE</div>
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="border-l-2 border-bc-amber/50 pl-3 py-1">
                        <div className="font-mono text-xs text-bc-muted/60 mb-1">
                          {new Date(note.created_at).toLocaleString('it-IT', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', hour12: false,
                          })}
                          {note.author && <span className="ml-2">// {note.author}</span>}
                        </div>
                        <div className="font-mono text-xs text-bc-amber/80 leading-relaxed whitespace-pre-wrap">
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
            ) : (
              (pilots as Pilot[]).map((p) => (
                <PilotCard key={p.id} pilot={p} onSelect={(pilot) => setSelected(pilot)} selected={(selected as Pilot | null)?.id === p.id} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
