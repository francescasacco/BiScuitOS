import { useState, useEffect, useCallback } from 'react'
import type { Mission, MissionFormData } from '@/types/mission'
import MappaSU from '@/assets/MappaSU.png'
import { MARKER_BORDER, MARKER_FILL_HEX, ZOOM_STEPS, STATUS_COLORS, STATUS_LABELS } from './missionConstants'
import { Plus, Minus } from 'lucide-react'

const MAP_RATIO = 1312 / 930

interface MissionMapOverlayProps {
  mapContainerRef: React.RefObject<HTMLDivElement>
  zoomStyle: React.CSSProperties
  isPanning: boolean
  zoomLevel: number
  zoomStep: number
  setZoomStep: React.Dispatch<React.SetStateAction<number>>
  missions: Mission[]
  selected: Mission | null
  tooltip: { id: string; x: number; y: number } | null
  setTooltip: (t: { id: string; x: number; y: number } | null) => void
  showForm: boolean
  form: MissionFormData
  repositioning: string | null
  isOperator: boolean
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
}

function useImageRect(containerRef: React.RefObject<HTMLDivElement>) {
  const [rect, setRect] = useState({ left: 0, top: 0, width: 0, height: 0 })

  const compute = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const cw = el.clientWidth
    const ch = el.clientHeight
    const containerRatio = cw / ch
    let iw: number, ih: number
    if (containerRatio > MAP_RATIO) {
      ih = ch; iw = ch * MAP_RATIO
    } else {
      iw = cw; ih = cw / MAP_RATIO
    }
    setRect({ left: (cw - iw) / 2, top: (ch - ih) / 2, width: iw, height: ih })
  }, [containerRef])

  useEffect(() => {
    compute()
    const ro = new ResizeObserver(compute)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [compute, containerRef])

  return rect
}

export function MissionMapOverlay({
  mapContainerRef, zoomStyle, isPanning, zoomLevel, zoomStep, setZoomStep,
  missions, selected, tooltip, setTooltip, showForm, form, repositioning,
  isOperator, onPointerDown, onPointerMove, onPointerUp,
}: MissionMapOverlayProps) {
  const isZoomed = zoomStep > 0
  const imgRect = useImageRect(mapContainerRef)
  const transition = isPanning ? 'none' : 'transform 300ms ease-in-out'

  const cursorClass = (showForm || repositioning) && isOperator
    ? ' cursor-crosshair'
    : isZoomed ? ' cursor-grab active:cursor-grabbing' : ' cursor-pointer'

  const waypoints = missions
    .filter(m => m.map_x != null && m.map_y != null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return (
    <>
      {tooltip && (() => {
        const m = missions.find(x => x.id === tooltip.id)
        if (!m) return null
        return (
          <div className="fixed z-50 pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y - 14, transform: 'translate(-50%, -100%)', whiteSpace: 'nowrap' }}>
            <div className="bg-bc-dark border border-bc-border rounded px-2.5 py-1.5 shadow-xl">
              <p className="font-mono text-xs font-bold text-bc-text">{m.title}</p>
              <p className={`font-mono text-xs mt-0.5 ${STATUS_COLORS[m.status].split(' ')[0]}`}>{STATUS_LABELS[m.status]}</p>
            </div>
            <div className="w-2 h-2 bg-bc-dark border-r border-b border-bc-border rotate-45 mx-auto -mt-[5px]" />
          </div>
        )
      })()}

      <div
        ref={mapContainerRef}
        className={`relative aspect-[4/3] md:aspect-auto overflow-hidden rounded-lg md:flex-1 md:min-h-0${cursorClass}`}
        style={{ touchAction: 'none', background: 'radial-gradient(ellipse at center, #d6d9d6 0%, #d6d9d6 90%, #f0f2f0 100%)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <img
          src={MappaSU}
          alt="Mappa di gioco"
          className="absolute inset-0 w-full h-full object-contain select-none"
          style={{ ...zoomStyle, transition }}
          draggable={false}
        />

        {imgRect.width > 0 && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: imgRect.left, top: imgRect.top,
              width: imgRect.width, height: imgRect.height,
              ...zoomStyle, transition,
              transformOrigin: zoomStyle.transformOrigin === '0 0'
                ? `${-imgRect.left}px ${-imgRect.top}px` : '0 0',
            }}
          >
            {waypoints.length >= 2 && (
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 1 }}>
                {waypoints.slice(0, -1).map((wp, i) => {
                  const next = waypoints[i + 1]
                  return (
                    <line key={`${wp.id}-${next.id}`}
                      x1={wp.map_x!} y1={wp.map_y!} x2={next.map_x!} y2={next.map_y!}
                      stroke={MARKER_FILL_HEX[wp.status]} strokeOpacity="0.7"
                      strokeWidth="0.5" strokeDasharray="1.5,1.5" strokeLinecap="round"
                    />
                  )
                })}
              </svg>
            )}

            {missions.filter(m => m.map_x != null && m.map_y != null).map(m => {
              const isSel = m.id === selected?.id
              const isTooltipVisible = tooltip?.id === m.id
              return (
                <div key={m.id} className="absolute flex flex-col items-center"
                  style={{
                    left: `${m.map_x}%`, top: `${m.map_y}%`,
                    transform: 'translate(-50%, -50%)', transformOrigin: 'center',
                    opacity: selected && !isSel ? 0.5 : 1,
                    transition: 'opacity 300ms', zIndex: 2,
                  }}
                >
                  {isTooltipVisible && (
                    <div className="absolute bottom-full mb-2 pointer-events-none z-50" style={{ whiteSpace: 'nowrap', transform: 'translateX(-50%)', left: '50%' }}>
                      <div className="bg-bc-dark border border-bc-border rounded px-2.5 py-1.5 shadow-xl">
                        <p className="font-mono text-xs font-bold text-bc-text">{m.title}</p>
                        <p className={`font-mono text-xs mt-0.5 ${STATUS_COLORS[m.status].split(' ')[0]}`}>{STATUS_LABELS[m.status]}</p>
                      </div>
                      <div className="w-2 h-2 bg-bc-dark border-r border-b border-bc-border rotate-45 mx-auto -mt-[5px]" />
                    </div>
                  )}
                  <div className="absolute pointer-events-auto" style={{ inset: '-8px' }}
                    onMouseEnter={() => setTooltip({ id: m.id, x: 0, y: 0 })}
                    onMouseLeave={() => setTooltip(null)}
                    onPointerDown={() => setTooltip({ id: m.id, x: 0, y: 0 })}
                  />
                  <div className={`rotate-45 border-2 transition-all duration-300 ${MARKER_BORDER[m.status]} ${isSel ? 'w-5 h-5' : 'w-3.5 h-3.5'}`} />
                </div>
              )
            })}
          </div>
        )}

        {showForm && form.map_x != null && imgRect.width > 0 && (
          <div className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: imgRect.left + form.map_x! / 100 * imgRect.width,
              top: imgRect.top + form.map_y! / 100 * imgRect.height,
              transform: `translate(-50%, -100%) ${zoomStyle.transform ?? ''}`,
              transformOrigin: zoomStyle.transformOrigin,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-bc-amber border border-white/30 animate-pulse" />
            <div className="w-px h-2 bg-bc-amber/50" />
          </div>
        )}

        {repositioning && isOperator && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10">
            <span className="font-mono text-xs text-bc-green/90 bg-bc-dark/90 px-3 py-1.5 rounded border border-bc-green/30 animate-pulse">
              clicca sulla mappa per aggiornare la posizione
            </span>
          </div>
        )}

        {showForm && isOperator && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
            <span className="font-mono text-xs text-bc-amber/80 bg-bc-dark/80 px-3 py-1.5 rounded border border-bc-amber/20">
              {form.map_x != null ? `${form.map_x}% — ${form.map_y}%` : 'clicca sulla mappa per posizionare la missione'}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10" onClick={e => e.stopPropagation()}>
          <button onPointerDown={e => e.stopPropagation()} onClick={() => setZoomStep(s => Math.min(s + 1, ZOOM_STEPS.length - 1))} disabled={zoomStep === ZOOM_STEPS.length - 1}
            className="w-6 h-6 flex items-center justify-center bg-bc-dark/80 border border-bc-border text-bc-muted hover:border-bc-green hover:text-bc-green disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded">
            <Plus size={10} strokeWidth={2} />
          </button>
          <button onPointerDown={e => e.stopPropagation()} onClick={() => setZoomStep(s => Math.max(s - 1, 0))} disabled={zoomStep === 0}
            className="w-6 h-6 flex items-center justify-center bg-bc-dark/80 border border-bc-border text-bc-muted hover:border-bc-green hover:text-bc-green disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded">
            <Minus size={10} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  )
}
