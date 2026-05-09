import { useState, useEffect, useRef } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { missionService } from '@/services/missionService'
import type { Mission, MissionStatus, MissionFormData } from '@/types/mission'
import { ZOOM_STEPS, EMPTY_FORM } from '@/components/missions/missionConstants'
import { computeClamp } from '@/components/missions/missionMapUtils'
import { MissionMapOverlay } from '@/components/missions/MissionMapOverlay'
import { MissionList } from '@/components/missions/MissionList'
import { MissionForm } from '@/components/missions/MissionForm'
import { MissionReport } from '@/components/missions/MissionReport'
import { STATUS_COLORS, STATUS_LABELS } from '@/components/missions/missionConstants'
import { X, Plus } from 'lucide-react'

export function MissionsInterface() {
  const { missions, addMission, updateMission, isOperator } = useOSStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<MissionFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Mission | null>(null)
  const [zoomStep, setZoomStep] = useState(0)
  const [tooltip, setTooltip] = useState<{ id: string; x: number; y: number } | null>(null)
  const [repositioning, setRepositioning] = useState<string | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ clientX: number; clientY: number; panX: number; panY: number } | null>(null)
  const hasDragged = useRef(false)
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchRef = useRef<{ dist: number; step: number } | null>(null)
  const zoomStepRef = useRef(zoomStep)
  const zoomCenterRef = useRef({ x: 50, y: 50 })
  const zoomLevelRef = useRef(ZOOM_STEPS[0])
  const panRef = useRef(pan)

  const zoomLevel = ZOOM_STEPS[zoomStep]
  const isZoomed = zoomStep > 0

  const zoomCenter = (selected?.map_x != null && selected?.map_y != null)
    ? { x: selected.map_x!, y: selected.map_y! }
    : { x: 50, y: 50 }

  useEffect(() => { zoomStepRef.current = zoomStep; zoomLevelRef.current = ZOOM_STEPS[zoomStep] }, [zoomStep])
  useEffect(() => { zoomCenterRef.current = zoomCenter }, [zoomCenter.x, zoomCenter.y])
  useEffect(() => { panRef.current = pan }, [pan])

  useEffect(() => { setPan({ x: 0, y: 0 }) }, [zoomCenter.x, zoomCenter.y])
  useEffect(() => { if (zoomStep === 0) setPan({ x: 0, y: 0 }) }, [zoomStep])

  const isPanning = useRef(false)

  const zoomStyle = isZoomed
    ? {
        transformOrigin: '0 0' as const,
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel}) translate(${50 / zoomLevel - zoomCenter.x}%, ${50 / zoomLevel - zoomCenter.y}%)`,
      }
    : { transformOrigin: '0 0' as const, transform: 'none' }

  useEffect(() => {
    const el = mapContainerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.deltaY < 0) setZoomStep(s => Math.min(s + 1, ZOOM_STEPS.length - 1))
      else              setZoomStep(s => Math.max(s - 1, 0))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const clampPan = (px: number, py: number) => {
    const el = mapContainerRef.current
    if (!el) return { x: 0, y: 0 }
    const { width: W, height: H } = el.getBoundingClientRect()
    return computeClamp(px, py, zoomLevel, zoomCenter.x, zoomCenter.y, W, H)
  }

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
    setSelected(prev => prev?.id === m.id ? null : m)
  }

  const handleUpdateCoords = async (id: string, x: number, y: number) => {
    try {
      const updated = await missionService.updateCoords(id, x, y)
      updateMission(updated)
    } catch (err) {
      console.error('[CRAWLER//OS] Aggiornamento coordinate fallito:', err)
    }
  }

  const getPinchDist = () => {
    const pts = Array.from(activePointers.current.values())
    if (pts.length < 2) return null
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (activePointers.current.size >= 2) {
      const dist = getPinchDist()
      if (dist) pinchRef.current = { dist, step: zoomStepRef.current }
      dragStart.current = null
    } else {
      dragStart.current = { clientX: e.clientX, clientY: e.clientY, panX: pan.x, panY: pan.y }
      hasDragged.current = false
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (activePointers.current.size >= 2 && pinchRef.current) {
      const dist = getPinchDist()
      if (dist) {
        const ratio = dist / pinchRef.current.dist
        const rawStep = pinchRef.current.step + Math.round(Math.log(ratio) / Math.log(1.4))
        setZoomStep(Math.max(0, Math.min(ZOOM_STEPS.length - 1, rawStep)))
      }
      return
    }

    if (!dragStart.current || !isZoomed) return
    const dx = e.clientX - dragStart.current.clientX
    const dy = e.clientY - dragStart.current.clientY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDragged.current = true
      isPanning.current = true
      setPan(clampPan(dragStart.current.panX + dx, dragStart.current.panY + dy))
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasDragged.current && activePointers.current.size === 1 && isOperator) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
      if (repositioning) {
        handleUpdateCoords(repositioning, x, y)
        setRepositioning(null)
      } else if (showForm) {
        setForm(p => ({ ...p, map_x: x, map_y: y }))
      }
    }
    activePointers.current.delete(e.pointerId)
    if (activePointers.current.size < 2) pinchRef.current = null
    dragStart.current = null
    isPanning.current = false
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-3 border-b border-bc-border shrink-0">
        <div>
          <h1 className="font-display text-lg font-bold text-bc-green text-glow tracking-widest">
            NUCLEO MISSIONI // ESPLORAZIONI
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
            {showForm ? 'ANNULLA' : <span className="flex items-center gap-1.5"><Plus size={12} strokeWidth={2.5} /> NUOVA MISSIONE</span>}
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 p-4 gap-4 overflow-hidden md:overflow-hidden overflow-y-auto">

        <div className="relative flex flex-col md:max-w-[65%] md:w-[65%] w-full shrink-0 min-h-0 overflow-hidden">
          <MissionMapOverlay
            mapContainerRef={mapContainerRef}
            zoomStyle={zoomStyle}
            isPanning={isPanning.current}
            zoomLevel={zoomLevel}
            zoomStep={zoomStep}
            setZoomStep={setZoomStep}
            missions={missions}
            selected={selected}
            tooltip={tooltip}
            setTooltip={setTooltip}
            showForm={showForm}
            form={form}
            repositioning={repositioning}
            isOperator={isOperator}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />

          <div
            className={`fixed inset-x-0 bottom-0 top-[148px] md:absolute md:inset-0 z-20 md:z-20 rounded-t-xl md:rounded-lg overflow-hidden transition-transform duration-300 ease-in-out md:p-0 ${
              selected?.report ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="absolute inset-0 bg-bc-black/60 backdrop-blur-sm md:block" onClick={() => setSelected(null)} />
            <div className="relative h-full flex flex-col bg-bc-panel/95 border border-bc-border/60 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(82,82,200,0.15)] mx-3 mb-4 md:mx-0 md:mb-0 max-h-[75vh] md:max-h-none">
              {selected && (
                <>
                  <div className="shrink-0 px-4 py-2.5 border-b border-bc-border bg-gradient-to-r from-bc-border/20 to-transparent flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`bc-tag ${STATUS_COLORS[selected.status]}`}>{STATUS_LABELS[selected.status]}</span>
                      <span className="font-display text-sm font-bold text-bc-text tracking-wider md:truncate break-words">{selected.title}</span>
                      {selected.report?.date && (
                        <span className="font-mono text-xs text-bc-muted/60 hidden sm:block">
                          {[selected.report.date, selected.report.place].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                    <button
                      className="shrink-0 p-1 text-bc-muted/40 hover:text-bc-text transition-colors"
                      onClick={() => setSelected(null)}
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1 px-4 py-3">
                    {selected.summary && (
                      <p className="font-sans text-sm text-bc-muted leading-relaxed mb-3 pb-3 border-b border-bc-border/30">
                        {selected.summary}
                      </p>
                    )}
                    {selected.report && <MissionReport report={selected.report} />}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
          {showForm && isOperator && (
            <MissionForm
              form={form}
              setForm={setForm}
              onSubmit={handleCreate}
              loading={loading}
            />
          )}
          <div className="flex-1 overflow-y-auto p-1 space-y-2">
            <MissionList
              missions={missions}
              selected={selected}
              onSelect={toggleSelect}
              isOperator={isOperator}
              repositioning={repositioning}
              onRepositionToggle={(id) => setRepositioning(prev => prev === id ? null : id)}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
