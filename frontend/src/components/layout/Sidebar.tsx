import { useNavigate, useLocation } from 'react-router-dom'
import { useOSStore } from '@/store/useOSStore'
import { OS_VERSION } from '@/config'

const NAV_ITEMS = [
  { path: '/',         label: 'FEED',        sublabel: 'principale', icon: '◈' },
  { path: '/crew',     label: 'EQUIPAGGIO',  sublabel: 'nodo crew',  icon: '◉' },
  { path: '/journal',  label: 'ARCHIVIO',    sublabel: 'log & dati', icon: '◫' },
  { path: '/missions', label: 'MISSIONI',    sublabel: 'nucleo ops', icon: '◆' },
]

const OPERATOR_ITEMS = [
  { path: '/core', label: 'CORE SYS', sublabel: 'accesso op.', icon: '⚠' },
]

function Divider({ char = '◈', variant = 'default' }: { char?: string; variant?: 'default' | 'amber' }) {
  const lineClass  = variant === 'amber' ? 'bg-bc-amber/40'  : 'bg-bc-border/40'
  const labelClass = variant === 'amber' ? 'text-bc-amber/60' : 'text-bc-muted/60'
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <div className={`flex-1 h-px ${lineClass}`} />
      <span className={`font-mono text-xs ${labelClass}`}>{char}</span>
      <div className={`flex-1 h-px ${lineClass}`} />
    </div>
  )
}

export function Sidebar() {
  const { isOperator, crawlerSystem, sidebarOpen, setSidebarOpen, pilots, missions } = useOSStore()
  const navigate  = useNavigate()
  const location  = useLocation()

  const fuelPct  = Math.min(100, ((crawlerSystem?.fuel  ?? 0) / 100) * 100)
  const scrapPct = Math.min(100, ((crawlerSystem?.scrap ?? 0) / 500) * 100)

  const activeMissions = Array.isArray(missions)
    ? missions.filter((m) => m.status === 'active').length
    : 0
  const pilotCount = Array.isArray(pilots) ? pilots.length : 0

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const handleNav = (path: string) => {
    navigate(path)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  return (
    <aside
      className={`
        w-56 h-full bc-panel border-t border-r border-b border-bc-border
        flex flex-col shrink-0
        fixed md:relative z-30
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* ── Header ─────────────────────────────── */}
      <div className="relative p-3 border-b border-bc-border">
        <span className="absolute top-1.5 left-1.5 font-mono text-bc-border/60 text-xs leading-none select-none">┌</span>
        <span className="absolute top-1.5 right-1.5 font-mono text-bc-border/60 text-xs leading-none select-none">┐</span>
        <span className="absolute bottom-1.5 left-1.5 font-mono text-bc-border/60 text-xs leading-none select-none">└</span>
        <span className="absolute bottom-1.5 right-1.5 font-mono text-bc-border/60 text-xs leading-none select-none">┘</span>

        <div className="text-center px-3">
          <div className="font-display text-bc-green text-sm font-bold tracking-widest text-glow">
            CR//OS
          </div>
          <div className="font-mono text-bc-muted/70 text-xs">{OS_VERSION}</div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="status-dot nominal" />
          <span className="font-mono text-bc-green text-xs tracking-wider">ONLINE</span>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────── */}
      <nav className="flex-1 overflow-y-auto">
        <Divider char="NAV" />

        <div className="px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`
                  w-full flex items-center gap-2 px-2 py-2 text-left group
                  border-l-2 transition-all duration-150
                  ${active
                    ? 'border-bc-green bg-bc-green/10 text-bc-green'
                    : 'border-transparent text-bc-muted hover:border-bc-green/40 hover:text-bc-green hover:bg-bc-green/5'}
                `}
              >
                <span className={`text-xs shrink-0 ${active ? 'text-glow' : 'opacity-60 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs uppercase tracking-wider leading-tight">
                    {item.label}
                  </div>
                  <div className={`font-mono text-xs leading-tight ${active ? 'text-bc-green/50' : 'text-bc-muted/40'}`}>
                    {item.sublabel}
                  </div>
                </div>
                {item.path === '/missions' && activeMissions > 0 && (
                  <span className="font-mono text-xs text-bc-green bg-bc-green/15 px-1 border border-bc-green/40 shrink-0">
                    {activeMissions}
                  </span>
                )}
                {item.path === '/crew' && pilotCount > 0 && (
                  <span className="font-mono text-xs text-bc-blue bg-bc-blue/10 px-1 border border-bc-blue/30 shrink-0">
                    {pilotCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {isOperator && (
          <>
            <Divider char="⚠" variant="amber" />
            <div className="px-2 space-y-0.5">
              {OPERATOR_ITEMS.map((item) => {
                const active = isActive(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`
                      w-full flex items-center gap-2 px-2 py-2 text-left group
                      border-l-2 transition-all duration-150
                      ${active
                        ? 'border-bc-amber bg-bc-amber/10 text-bc-amber'
                        : 'border-transparent text-bc-amber/50 hover:border-bc-amber/50 hover:text-bc-amber hover:bg-bc-amber/5'}
                    `}
                  >
                    <span className="text-xs shrink-0 opacity-70 group-hover:opacity-100">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs uppercase tracking-wider leading-tight">{item.label}</div>
                      <div className={`font-mono text-xs leading-tight ${active ? 'text-bc-amber/50' : 'text-bc-amber/30'}`}>{item.sublabel}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* ── Resource Monitor ───────────────────── */}
      <div className="border-t border-bc-border p-3 space-y-2">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="flex-1 h-px bg-bc-border/40" />
          <span className="font-mono text-bc-muted/60 text-xs tracking-widest">SYS</span>
          <div className="flex-1 h-px bg-bc-border/40" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-xs mb-1">
            <span className="text-bc-muted/70 tracking-wider">CARB.</span>
            <span className="text-bc-green">
              {crawlerSystem?.fuel ?? '—'}<span className="text-bc-muted/40">/100</span>
            </span>
          </div>
          <div className="h-1 bg-bc-black border border-bc-border/30 overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${fuelPct}%`, background: 'var(--bc-green)', boxShadow: '0 0 4px var(--bc-green)' }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-mono text-xs mb-1">
            <span className="text-bc-muted/70 tracking-wider">ROTTAMI</span>
            <span className="text-bc-amber">
              {crawlerSystem?.scrap ?? '—'}<span className="text-bc-muted/40">/500</span>
            </span>
          </div>
          <div className="h-1 bg-bc-black border border-bc-border/30 overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${scrapPct}%`, background: 'var(--bc-amber)', boxShadow: '0 0 4px var(--bc-amber)' }}
            />
          </div>
        </div>

        <div className="flex justify-between font-mono text-xs pt-1 border-t border-bc-border/30">
          <span className="text-bc-muted/70 tracking-wider">ENG.</span>
          <span className="text-bc-blue">{crawlerSystem?.engineers ?? '—'}</span>
        </div>
      </div>

      {/* ── Operator badge ─────────────────────── */}
      {isOperator && (
        <div className="border-t border-bc-border px-3 py-2">
          <div className="font-mono text-bc-amber/50 text-xs text-center tracking-widest">
            ◈ OP. ATTIVO ◈
          </div>
        </div>
      )}
    </aside>
  )
}
