import { useState, useEffect, useRef } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { missionService } from '@/services/missionService'
import type { Mission, MissionStatus, MissionFormData } from '@/types/mission'
import { CustomSelect } from '@/components/ui/CustomSelect'
import MappaSU from '@/assets/MappaSU.png'

const STATUS_COLORS: Record<MissionStatus, string> = {
  active:     'text-bc-green border-bc-green',
  pending:    'text-bc-amber border-bc-amber',
  completed:  'text-bc-muted border-bc-muted',
  failed:     'text-bc-red border-bc-red',
  classified: 'text-bc-blue border-bc-blue',
}

const STATUS_LABELS: Record<MissionStatus, string> = {
  active:     'ATTIVA',
  pending:    'IN ATTESA',
  completed:  'COMPLETATA',
  failed:     'FALLITA',
  classified: 'CLASSIFICATA',
}

const MARKER_COLOR: Record<MissionStatus, string> = {
  active:     'bg-bc-green shadow-[0_0_6px_var(--bc-green)]',
  pending:    'bg-bc-amber',
  completed:  'bg-bc-muted',
  failed:     'bg-bc-red',
  classified: 'bg-bc-blue',
}

const ZOOM = 2.5
const EMPTY_FORM: MissionFormData = { title: '', status: 'pending', summary: '', reward: '' }

export function MissionsInterface() {
  const { missions, addMission, updateMission, isOperator } = useOSStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<MissionFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Mission | null>(null)
  const [tapZoom, setTapZoom] = useState<{ x: number; y: number } | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragStart = useRef<{ clientX: number; clientY: number; panX: number; panY: number } | null>(null)
  const hasDragged = useRef(false)

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setLoading(true)
    try {
      const mission = await missionService.create(form)
      addMission(mission)
      setForm({ ...EMPTY_FORM })
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

  const toggleSelect = (m: Mission) => {
    setTapZoom(null)
    setSelected(prev => prev?.id === m.id ? null : m)
  }

  const zoomPoint =
    (selected?.map_x != null && selected?.map_y != null)
      ? { x: selected.map_x!, y: selected.map_y! }
      : tapZoom ?? null

  const isZoomed = zoomPoint != null

  // Reset pan whenever zoom target changes
  useEffect(() => { setPan({ x: 0, y: 0 }) }, [zoomPoint?.x, zoomPoint?.y])

  const zoomStyle = zoomPoint
    ? {
        transformOrigin: '0 0' as const,
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${ZOOM}) translate(${20 - zoomPoint.x}%, ${20 - zoomPoint.y}%)`,
      }
    : { transformOrigin: '0 0' as const, transform: 'none' }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = { clientX: e.clientX, clientY: e.clientY, panX: pan.x, panY: pan.y }
    hasDragged.current = false
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current || !isZoomed) return
    const dx = e.clientX - dragStart.current.clientX
    const dy = e.clientY - dragStart.current.clientY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDragged.current = true
      setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy })
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasDragged.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
      if (showForm && isOperator) {
        setForm(p => ({ ...p, map_x: x, map_y: y }))
      } else {
        setSelected(null)
        setTapZoom(prev => prev ? null : { x, y })
      }
    }
    dragStart.current = null
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b border-bc-border shrink-0">
        <div>
          <h1 className="font-display text-lg font-bold text-bc-green text-glow tracking-widest">
            NUCLEO MISSIONI
          </h1>
          <p className="font-mono text-xs text-bc-muted mt-0.5">
            {missions.filter(m => m.status === 'active').length} attive / {missions.length} totali
          </p>
        </div>
        {isOperator && (
          <button
            className="bc-btn-amber self-start sm:self-auto"
            onClick={() => { setShowForm(s => !s); setSelected(null) }}
          >
            {showForm ? 'ANNULLA' : '+ NUOVA MISSIONE'}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 p-4 gap-4 overflow-hidden md:overflow-hidden overflow-y-auto">

        {/* Mappa — outer: padding + bordo; inner: overflow-hidden per clip zoom */}
        <div className="flex flex-col md:max-w-[65%] md:w-[65%] w-full rounded-xl bg-bc-black py-3 shrink-0">
          <div
            className={`relative aspect-[4/3] md:aspect-auto overflow-hidden rounded-lg md:flex-1 md:min-h-0${showForm && isOperator ? ' cursor-crosshair' : isZoomed ? ' cursor-grab active:cursor-grabbing' : ''}`}
            style={{ touchAction: isZoomed ? 'none' : 'auto' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <img
              src={MappaSU}
              alt="Mappa di gioco"
              className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 ease-in-out select-none"
              style={zoomStyle}
              draggable={false}
            />

            {/* Marker missioni */}
            {missions.filter(m => m.map_x != null && m.map_y != null).map(m => {
              const isSel = m.id === selected?.id
              const left = isSel && isZoomed ? 50 : m.map_x!
              const top  = isSel && isZoomed ? 50 : m.map_y!
              return (
                <div
                  key={m.id}
                  className="absolute flex flex-col items-center transition-all duration-700 pointer-events-none"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    transform: 'translate(-50%, -100%)',
                    opacity: isZoomed && !isSel ? 0 : 1,
                  }}
                >
                  <div className={`rounded-full border border-white/20 transition-all duration-300 ${MARKER_COLOR[m.status]} ${isSel ? 'w-4 h-4' : 'w-2.5 h-2.5'}`} />
                  <div className="w-px h-2 bg-white/30" />
                </div>
              )
            })}

            {/* Preview marker durante la compilazione del form */}
            {showForm && form.map_x != null && (
              <div
                className="absolute flex flex-col items-center pointer-events-none"
                style={{ left: `${form.map_x}%`, top: `${form.map_y}%`, transform: 'translate(-50%, -100%)' }}
              >
                <div className="w-3 h-3 rounded-full bg-bc-amber border border-white/30 animate-pulse" />
                <div className="w-px h-2 bg-bc-amber/50" />
              </div>
            )}

            {/* Hint posizionamento */}
            {showForm && isOperator && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
                <span className="font-mono text-xs text-bc-amber/80 bg-bc-dark/80 px-3 py-1.5 rounded border border-bc-amber/20">
                  {form.map_x != null
                    ? `📍 ${form.map_x}% — ${form.map_y}%`
                    : 'clicca sulla mappa per posizionare la missione'}
                </span>
              </div>
            )}
          </div>
          {tapZoom && !showForm && (
            <p className="font-mono text-xs text-bc-muted/60 text-center mt-2 pointer-events-none">
              tocca per tornare indietro
            </p>
          )}
        </div>

        {/* Sidebar destra */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">

          {/* Form nuova missione */}
          {showForm && isOperator && (
            <div className="shrink-0 p-4 space-y-2 border-b border-bc-amber/20 bg-bc-dark">
              <div className="bc-section-header" style={{ color: 'var(--bc-amber)' }}>// NUOVA MISSIONE</div>
              <input
                className="bc-input"
                placeholder="TITOLO MISSIONE..."
                value={form.title}
                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              />
              <CustomSelect
                value={form.status}
                onChange={(v) => setForm(p => ({ ...p, status: v as MissionStatus }))}
                options={['active', 'pending', 'classified']}
                getLabel={(v) => STATUS_LABELS[v as MissionStatus]}
              />
              <textarea
                className="bc-textarea"
                rows={2}
                placeholder="SOMMARIO MISSIONE..."
                value={form.summary ?? ''}
                onChange={(e) => setForm(p => ({ ...p, summary: e.target.value }))}
              />
              <input
                className="bc-input"
                placeholder="RICOMPENSA..."
                value={form.reward ?? ''}
                onChange={(e) => setForm(p => ({ ...p, reward: e.target.value }))}
              />
              <button
                className="bc-btn-amber w-full"
                onClick={handleCreate}
                disabled={loading || !form.title.trim()}
              >
                {loading ? 'CREAZIONE...' : 'CREA MISSIONE'}
              </button>
            </div>
          )}

          {/* Lista missioni */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {missions.length === 0 ? (
              <div className="bc-panel border border-bc-border p-6 text-center">
                <p className="font-mono text-bc-muted text-sm">NESSUNA MISSIONE NEL SISTEMA</p>
              </div>
            ) : (
              missions.map(m => {
                const isSel = m.id === selected?.id
                return (
                  <div
                    key={m.id}
                    className={`bc-panel border p-3 cursor-pointer transition-all duration-150 ${
                      isSel ? 'border-bc-accent bg-bc-accent/5 border-glow' : 'border-bc-border hover:border-bc-border/80 hover:bg-bc-panel'
                    }`}
                    onClick={() => toggleSelect(m)}
                  >
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`bc-tag ${STATUS_COLORS[m.status]} text-xs`}>
                        {STATUS_LABELS[m.status]}
                      </span>
                      {m.map_x != null && (
                        <span className="font-mono text-bc-muted/40 text-xs">📍</span>
                      )}
                    </div>
                    <p className={`font-mono text-xs font-bold ${STATUS_COLORS[m.status].split(' ')[0]}`}>
                      {m.title}
                    </p>
                    {m.summary && (
                      <p className="font-mono text-xs text-bc-muted mt-1 line-clamp-2">{m.summary}</p>
                    )}
                    {m.reward && (
                      <p className="font-mono text-xs text-bc-amber mt-1">↳ {m.reward}</p>
                    )}
                    {isOperator && (
                      <div className="mt-2" onClick={e => e.stopPropagation()}>
                        <CustomSelect
                          value={m.status}
                          onChange={(v) => handleStatusChange(m.id, v as MissionStatus)}
                          options={['active', 'pending', 'completed', 'failed', 'classified']}
                          getLabel={(v) => STATUS_LABELS[v as MissionStatus]}
                        />
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
