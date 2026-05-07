import { useEffect, useState } from 'react'
import { useOSStore } from '@/store/useOSStore'
import { BOOT_MESSAGES, OS_NAME, OS_SUBTITLE } from '@/config'

function CrawlerMech() {
  return (
    <svg
      width="200" height="160"
      viewBox="0 0 200 160"
      style={{ filter: 'drop-shadow(0 0 8px rgba(57,255,136,0.5))' }}
    >
      {/* ── Scanner tower ── */}
      <line x1="100" y1="14" x2="100" y2="4" stroke="#39ff88" strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="3" r="3" fill="#39ff88" style={{ animation: 'mech-glow-pulse 1s ease-in-out infinite' }} />
      <rect x="78" y="14" width="44" height="18" rx="5"
        fill="rgba(57,255,136,0.08)" stroke="#39ff88" strokeWidth="1.8" />
      {/* rotating scanner beam */}
      <g transform="translate(100,23)" style={{ transformOrigin: '0px 0px', animation: 'mech-scanner 2.5s linear infinite' }}>
        <line x1="0" y1="0" x2="18" y2="0" stroke="#39ff88" strokeWidth="1.2" opacity="0.7" />
        <circle cx="18" cy="0" r="2" fill="#39ff88" opacity="0.7" />
      </g>

      {/* ── Main body ── */}
      <rect x="38" y="32" width="124" height="54" rx="6"
        fill="rgba(57,255,136,0.07)" stroke="#39ff88" strokeWidth="2" />
      {/* cockpit frame */}
      <rect x="55" y="40" width="90" height="32" rx="3"
        fill="rgba(57,255,136,0.12)" stroke="#39ff88" strokeWidth="1.5" />
      {/* cockpit window */}
      <rect x="62" y="45" width="76" height="20" rx="2"
        fill="rgba(57,255,136,0.18)" stroke="#39ff88" strokeWidth="1" />
      {/* chest reactor */}
      <circle cx="100" cy="86" r="5"
        fill="rgba(57,255,136,0.3)" stroke="#39ff88" strokeWidth="1.5"
        style={{ animation: 'mech-glow-pulse 0.8s ease-in-out infinite' }} />

      {/* ── Left cannon ── */}
      <rect x="4" y="47" width="34" height="11" rx="4"
        fill="rgba(57,255,136,0.06)" stroke="#39ff88" strokeWidth="1.5" />
      <circle cx="4" cy="52" r="4" fill="rgba(57,255,136,0.2)" stroke="#39ff88" strokeWidth="1.2" />

      {/* ── Right cannon ── */}
      <rect x="162" y="47" width="34" height="11" rx="4"
        fill="rgba(57,255,136,0.06)" stroke="#39ff88" strokeWidth="1.5" />
      <circle cx="196" cy="52" r="4" fill="rgba(57,255,136,0.2)" stroke="#39ff88" strokeWidth="1.2" />

      {/* ── Left leg (translate hip to 72,86, rotate around 0,0) ── */}
      <g transform="translate(72,86)"
        style={{ transformOrigin: '0px 0px', animation: 'mech-leg-fwd 0.65s ease-in-out infinite' }}>
        <line x1="0" y1="0" x2="-6" y2="28" stroke="#39ff88" strokeWidth="5" strokeLinecap="round" />
        <circle cx="-6" cy="28" r="4.5" fill="var(--bc-dark)" stroke="#39ff88" strokeWidth="1.5" />
        <line x1="-6" y1="28" x2="-10" y2="56" stroke="#39ff88" strokeWidth="4" strokeLinecap="round" />
        <rect x="-20" y="53" width="22" height="7" rx="3"
          fill="rgba(57,255,136,0.15)" stroke="#39ff88" strokeWidth="1.5" />
      </g>

      {/* ── Right leg (opposite phase) ── */}
      <g transform="translate(128,86)"
        style={{ transformOrigin: '0px 0px', animation: 'mech-leg-bwd 0.65s ease-in-out infinite' }}>
        <line x1="0" y1="0" x2="6" y2="28" stroke="#39ff88" strokeWidth="5" strokeLinecap="round" />
        <circle cx="6" cy="28" r="4.5" fill="var(--bc-dark)" stroke="#39ff88" strokeWidth="1.5" />
        <line x1="6" y1="28" x2="10" y2="56" stroke="#39ff88" strokeWidth="4" strokeLinecap="round" />
        <rect x="-2" y="53" width="22" height="7" rx="3"
          fill="rgba(57,255,136,0.15)" stroke="#39ff88" strokeWidth="1.5" />
      </g>
    </svg>
  )
}

export function BootScreen() {
  const setIsBooting = useOSStore((s) => s.setIsBooting)
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < BOOT_MESSAGES.length) {
        const line = BOOT_MESSAGES[i]
        setVisibleLines((prev) => [...prev, line])
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => setDone(true), 500)
        setTimeout(() => setIsBooting(false), 1200)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [setIsBooting])

  const progress = Math.round((visibleLines.length / BOOT_MESSAGES.length) * 100)

  return (
    <div
      className={`fixed inset-0 z-50 bg-bc-black flex flex-col items-center justify-center gap-4 px-6 transition-opacity duration-700 ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Title */}
      <h1 className="font-display text-3xl md:text-4xl font-black tracking-widest text-glow"
        style={{ color: 'var(--bc-green)' }}>
        {OS_NAME}
      </h1>
      <p className="font-mono text-xs text-bc-muted tracking-widest">{OS_SUBTITLE}</p>

      {/* Mech */}
      <CrawlerMech />

      {/* Boot lines */}
      <div className="w-full max-w-xl font-mono text-sm space-y-0.5">
        {visibleLines.map((line, i) => (
          <p
            key={i}
            className={`animate-boot-in ${
              line.includes('ATTENZIONE') ? 'text-bc-amber' :
              line.includes('COMPLETATA') || line.includes('BENVENUTO') ? 'text-glow' :
              'text-bc-green'
            }`}
            style={{ animationDelay: '0s', opacity: 1 }}
          >
            {line}
          </p>
        ))}
        {visibleLines.length < BOOT_MESSAGES.length && (
          <p className="text-bc-green cursor-blink">&nbsp;</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xl">
        <div className="flex justify-between font-mono text-xs text-bc-muted mb-1">
          <span>INIZIALIZZAZIONE</span>
          <span>{progress}%</span>
        </div>
        <div className="h-0.5 bg-bc-track w-full overflow-hidden">
          <div
            className="h-full bg-bc-green transition-all duration-150"
            style={{ width: `${progress}%`, boxShadow: '0 0 6px var(--bc-green)' }}
          />
        </div>
      </div>
    </div>
  )
}
