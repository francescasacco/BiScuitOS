import { useEffect, useRef, useState } from 'react'
import { OPERATOR_NAME, BISCUIT_LOADER_DURATION, BISCUIT_LOADER_MESSAGES } from '@/config'
import { audioManager } from '@/lib/audioManager'


function generateCookiePath(
  cx: number, cy: number,
  innerR: number, outerR: number,
  n: number
): string {
  let d = ''
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * 2 * Math.PI - Math.PI / 2
    const a2 = ((i + 0.5) / n) * 2 * Math.PI - Math.PI / 2
    const a3 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2
    const v1x = cx + innerR * Math.cos(a1)
    const v1y = cy + innerR * Math.sin(a1)
    const tx  = cx + outerR * Math.cos(a2)
    const ty  = cy + outerR * Math.sin(a2)
    const v2x = cx + innerR * Math.cos(a3)
    const v2y = cy + innerR * Math.sin(a3)
    if (i === 0) d += `M ${v1x.toFixed(2)} ${v1y.toFixed(2)}`
    d += ` Q ${tx.toFixed(2)} ${ty.toFixed(2)} ${v2x.toFixed(2)} ${v2y.toFixed(2)}`
  }
  return d + ' Z'
}

const SZ = 120
const CX = 60
const CY = 60
const INNER_R = 42
const OUTER_R = 52

const cookiePath = generateCookiePath(CX, CY, INNER_R, OUTER_R, 14)

const dots: { x: number; y: number }[] = []
for (let row = -3; row <= 3; row++) {
  for (let col = -3; col <= 3; col++) {
    const x = CX + col * 12
    const y = CY + row * 12
    if (Math.sqrt((x - CX) ** 2 + (y - CY) ** 2) < INNER_R - 9) {
      dots.push({ x, y })
    }
  }
}

const RING_R = 82
const CIRC = 2 * Math.PI * RING_R

export function BiscuitLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const rafRef   = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => { audioManager.start() }, [])

  useEffect(() => {
    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now
      const pct = Math.min(100, ((now - startRef.current) / BISCUIT_LOADER_DURATION) * 100)
      setProgress(pct)
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setTimeout(() => { setFading(true); setTimeout(onComplete, 700) }, 600)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [onComplete])

  const dashOffset = CIRC * (1 - progress / 100)
  const loadingMsgs = BISCUIT_LOADER_MESSAGES.slice(0, -1)
  const finalMsg    = BISCUIT_LOADER_MESSAGES[BISCUIT_LOADER_MESSAGES.length - 1]
  const activeMsg   = progress >= 100
    ? finalMsg
    : loadingMsgs[Math.min(loadingMsgs.length - 1, Math.floor((progress / 100) * loadingMsgs.length))]

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 transition-opacity duration-700 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'var(--bc-black)' }}
    >
      <p className="font-mono text-xs tracking-[0.3em]" style={{ color: 'var(--bc-muted)' }}>
        ACCESSO OPERATORE
      </p>

      <h1
        className="font-display text-5xl font-black tracking-widest"
        style={{ color: 'var(--bc-amber)', textShadow: '0 0 24px var(--bc-amber)' }}
      >
        {OPERATOR_NAME}
      </h1>

      <div className="relative" style={{ width: 200, height: 200 }}>

        <svg
          className="absolute inset-0"
          width={200} height={200}
          viewBox="0 0 200 200"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle cx={100} cy={100} r={RING_R}
            fill="none" stroke="rgba(200,120,30,0.2)" strokeWidth="5" />
          <circle cx={100} cy={100} r={RING_R}
            fill="none" stroke="#ffb83a" strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            style={{ filter: 'drop-shadow(0 0 8px #ffb83a)' }}
          />
        </svg>

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ animation: 'cookie-spin 3s linear infinite' }}
        >
          <svg width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`}>
            <path
              d={cookiePath}
              fill="#c47a28"
              stroke="#e8960a"
              strokeWidth="2.5"
              style={{ filter: 'drop-shadow(0 0 6px rgba(228,150,10,0.8))' }}
            />
            {dots.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r="3" fill="#6b3a0a" />
            ))}
            <line
              x1={CX - INNER_R + 10} y1={CY}
              x2={CX + INNER_R - 10} y2={CY}
              stroke="#6b3a0a" strokeWidth="1.5" strokeLinecap="round"
            />
            <line
              x1={CX} y1={CY - INNER_R + 10}
              x2={CX} y2={CY + INNER_R - 10}
              stroke="#6b3a0a" strokeWidth="1.5" strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <p
        className="font-mono text-4xl font-bold"
        style={{ color: 'var(--bc-amber)', textShadow: '0 0 12px var(--bc-amber)' }}
      >
        {Math.round(progress)}%
      </p>

      <p className="font-mono text-xs animate-pulse" style={{ color: 'var(--bc-green)', minHeight: '1rem' }}>
        {'> '}{activeMsg}
      </p>
    </div>
  )
}
