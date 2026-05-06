import { useState } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { PilotCard } from '@/components/crew/PilotCard'
import { PilotForm } from '@/components/crew/PilotForm'
import type { Pilot } from '@/types/pilot'

export function CrewInterface() {
  const { pilots, journalEntries, isOperator } = useOSStore()
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Pilot | null>(null)

  return (
    <div className="h-full overflow-y-auto p-3"><div className="space-y-3 animate-boot-in">
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

      {showForm ? (
        <div className="bc-panel border border-bc-border p-6">
          <div className="bc-section-header">// INIEZIONE NUOVO PILOTA</div>
          <PilotForm onClose={() => setShowForm(false)} />
        </div>
      ) : selected ? (
        <div className="bc-panel border border-bc-green/40 p-6 border-glow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-bold text-bc-green text-glow">
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
                ['MOTTO', selected.motto_attivato],
                ['CIMELIO', selected.cimelio],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label}>
                  <div className="font-mono text-bc-muted text-xs">{label}</div>
                  <div className="font-mono text-sm text-bc-green">{value}</div>
                </div>
              ))}
              {selected.aspetto && (
                <div>
                  <div className="font-mono text-bc-muted text-xs">ASPETTO</div>
                  <div className="font-mono text-xs text-bc-green/80 leading-relaxed">{selected.aspetto}</div>
                </div>
              )}
              {selected.background && (
                <div>
                  <div className="font-mono text-bc-muted text-xs">BACKGROUND</div>
                  <div className="font-mono text-xs text-bc-green/80 leading-relaxed">{selected.background}</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="bc-section-header">// UNITÀ MECH</div>
              {selected.mech_nome ? (
                <>
                  {[
                    ['NOME', selected.mech_nome],
                    ['STATO', selected.mech_status],
                    ['INFO', selected.mech_info],
                    ['SISTEMI', selected.mech_sistemi],
                    ['MODULI', selected.mech_moduli],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label}>
                      <div className="font-mono text-bc-muted text-xs">{label}</div>
                      <div className="font-mono text-xs text-bc-blue leading-relaxed">{value}</div>
                    </div>
                  ))}
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
    </div></div>
  )
}
