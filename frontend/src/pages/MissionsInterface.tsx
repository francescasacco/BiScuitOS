import { useState } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { missionService } from '@/services/missionService'
import type { MissionStatus, MissionFormData } from '@/types/mission'

const STATUS_COLORS: Record<MissionStatus, string> = {
  active: 'text-bc-green border-bc-green',
  pending: 'text-bc-amber border-bc-amber',
  completed: 'text-bc-muted border-bc-muted',
  failed: 'text-bc-red border-bc-red',
  classified: 'text-bc-blue border-bc-blue',
}

const STATUS_LABELS: Record<MissionStatus, string> = {
  active: 'ATTIVA',
  pending: 'IN ATTESA',
  completed: 'COMPLETATA',
  failed: 'FALLITA',
  classified: 'CLASSIFICATA',
}

export function MissionsInterface() {
  const { missions, addMission, updateMission, isOperator } = useOSStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<MissionFormData>({
    title: '', status: 'pending', summary: '', reward: '',
  })
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setLoading(true)
    try {
      const mission = await missionService.create(form)
      addMission(mission)
      setForm({ title: '', status: 'pending', summary: '', reward: '' })
      setShowForm(false)
    } catch (err) {
      console.error('[CRAWLER//OS] Creazione missione fallita:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: MissionStatus) => {
    try {
      const updated = await missionService.updateStatus(id, status)
      updateMission(updated)
    } catch (err) {
      console.error('[CRAWLER//OS] Aggiornamento stato fallito:', err)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-3"><div className="space-y-3 animate-boot-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-bc-border pb-3">
        <div>
          <h1 className="font-display text-lg font-bold text-bc-green text-glow tracking-widest">
            NUCLEO MISSIONI
          </h1>
          <p className="font-mono text-xs text-bc-muted mt-0.5">
            {missions.filter((m) => m.status === 'active').length} attive / {missions.length} totali
          </p>
        </div>
        {isOperator && (
          <button className="bc-btn-amber self-start sm:self-auto" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'ANNULLA' : '+ NUOVA MISSIONE'}
          </button>
        )}
      </div>

      {showForm && isOperator && (
        <div className="bc-panel border border-bc-amber/40 p-4">
          <div className="bc-section-header" style={{ color: 'var(--bc-amber)' }}>// NUOVA VOCE MISSIONE</div>
          <div className="space-y-3">
            <input className="bc-input" placeholder="TITOLO MISSIONE..." value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
            <select className="bc-select" value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value as MissionStatus }))}>
              {(['active', 'pending', 'classified'] as MissionStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <textarea className="bc-textarea" rows={2} placeholder="SOMMARIO MISSIONE..." value={form.summary ?? ''} onChange={(e) => setForm(p => ({ ...p, summary: e.target.value }))} />
            <input className="bc-input" placeholder="RICOMPENSA..." value={form.reward ?? ''} onChange={(e) => setForm(p => ({ ...p, reward: e.target.value }))} />
            <button className="bc-btn-amber w-full" onClick={handleCreate} disabled={loading}>
              {loading ? 'CREAZIONE...' : 'CREA MISSIONE'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {missions.length === 0 ? (
          <div className="bc-panel border border-bc-border p-8 text-center">
            <p className="font-mono text-bc-muted text-sm">NESSUNA MISSIONE NEL SISTEMA</p>
          </div>
        ) : (
          missions.map((m) => (
            <div key={m.id} className={`bc-panel border p-4 ${STATUS_COLORS[m.status].split(' ')[1]}`}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`bc-tag ${STATUS_COLORS[m.status]} text-xs`}>
                      {STATUS_LABELS[m.status]}
                    </span>
                    <span className={`font-mono text-sm font-bold ${STATUS_COLORS[m.status].split(' ')[0]}`}>
                      {m.title}
                    </span>
                  </div>
                  {m.summary && (
                    <p className="font-mono text-xs text-bc-muted mt-2">{m.summary}</p>
                  )}
                  {m.reward && (
                    <p className="font-mono text-xs text-bc-amber mt-1">RICOMPENSA: {m.reward}</p>
                  )}
                  <p className="font-mono text-xs text-bc-muted/50 mt-2">
                    {new Date(m.created_at).toLocaleString('it-IT')}
                  </p>
                </div>
                {isOperator && (
                  <select
                    className="bc-select text-xs w-full sm:w-36 border-bc-muted shrink-0"
                    value={m.status}
                    onChange={(e) => handleStatusChange(m.id, e.target.value as MissionStatus)}
                  >
                    {(['active', 'pending', 'completed', 'failed', 'classified'] as MissionStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div></div>
  )
}
