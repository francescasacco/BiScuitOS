import { useNavigate, useLocation } from 'react-router-dom'
import { useOSStore } from '@/store/useOSStore'
import { OS_VERSION } from '@/config'

const NAV_ITEMS = [
  { path: '/',         label: 'Feed',        sub: 'principale',  icon: '◈' },
  { path: '/crew',     label: 'Equipaggio',  sub: 'registro',    icon: '◉' },
  { path: '/journal',  label: 'Archivio',    sub: 'log & dati',  icon: '◫' },
  { path: '/missions', label: 'Missioni',    sub: 'nucleo ops',  icon: '◆' },
]

const OPERATOR_ITEMS = [
  { path: '/core', label: 'Core System', sub: 'operatore', icon: '⚡' },
]

export function Sidebar() {
  const { isOperator, crawlerSystem, sidebarOpen, setSidebarOpen, pilots, missions } = useOSStore()
  const navigate  = useNavigate()
  const location  = useLocation()

  const fuelPct  = Math.min(100, ((crawlerSystem?.fuel  ?? 0) / 100) * 100)
  const scrapPct = Math.min(100, ((crawlerSystem?.scrap ?? 0) / 500) * 100)

  const activeMissions = Array.isArray(missions) ? missions.filter((m) => m.status === 'active').length : 0
  const pilotCount     = Array.isArray(pilots) ? pilots.length : 0

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const handleNav = (path: string) => {
    navigate(path)
  }

  return (
    <aside
      className={`
        w-56 h-full flex flex-col shrink-0
        bg-bc-dark border-r border-bc-border
        fixed md:relative z-30
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <div className="px-5 pt-5 pb-4 border-b border-bc-border">
        <div className="font-display text-sm font-bold tracking-widest text-bc-green text-glow-green">
          CR//OS
        </div>
        <div className="font-mono text-bc-muted text-xs mt-0.5">{OS_VERSION}</div>
        <div className="flex items-center gap-2 mt-3">
          <span className="status-dot nominal" />
          <span className="font-sans text-bc-green text-xs font-medium">Sistemi online</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="font-sans text-bc-muted text-xs font-semibold uppercase tracking-widest px-2 mb-3">
          Navigazione
        </p>

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                transition-all duration-150 group
                ${active
                  ? 'bg-bc-accent/15 text-bc-text'
                  : 'text-bc-muted hover:bg-bc-panel hover:text-bc-text'}
              `}
            >
              <span className={`text-sm shrink-0 ${active ? 'text-bc-accent' : 'text-bc-muted/60 group-hover:text-bc-accent/70'}`}>
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`font-sans text-sm font-medium ${active ? 'text-bc-text' : ''}`}>
                  {item.label}
                </div>
                <div className="font-sans text-xs text-bc-muted/60">{item.sub}</div>
              </div>
              {item.path === '/missions' && activeMissions > 0 && (
                <span className="font-mono text-xs text-bc-accent bg-bc-accent/15 px-1.5 py-0.5 rounded-full shrink-0">
                  {activeMissions}
                </span>
              )}
              {item.path === '/crew' && pilotCount > 0 && (
                <span className="font-mono text-xs text-bc-blue bg-bc-blue/15 px-1.5 py-0.5 rounded-full shrink-0">
                  {pilotCount}
                </span>
              )}
            </button>
          )
        })}

        {isOperator && (
          <>
            <div className="pt-3 pb-1 px-2">
              <div className="h-px bg-bc-border" />
              <p className="font-sans text-bc-amber text-xs font-semibold uppercase tracking-widest mt-3">
                Operatore
              </p>
            </div>
            {OPERATOR_ITEMS.map((item) => {
              const active = isActive(item.path)
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    transition-all duration-150 group
                    ${active
                      ? 'bg-bc-amber/12 text-bc-amber'
                      : 'text-bc-muted hover:bg-bc-panel hover:text-bc-amber/80'}
                  `}
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-sm font-medium">{item.label}</div>
                    <div className="font-sans text-xs text-bc-muted/60">{item.sub}</div>
                  </div>
                </button>
              )
            })}
          </>
        )}
      </nav>

      <div className="px-5 py-4 border-t border-bc-border space-y-3">
        <p className="font-sans text-bc-muted text-xs font-semibold uppercase tracking-widest">Risorse</p>

        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between font-sans text-xs mb-1">
              <span className="text-bc-muted">Carburante</span>
              <span className="font-mono text-bc-green text-xs">{crawlerSystem?.fuel ?? '—'}</span>
            </div>
            <div className="h-1 rounded-full bg-bc-border overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${fuelPct}%`, background: 'var(--bc-green)', boxShadow: '0 0 6px var(--bc-green)' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-sans text-xs mb-1">
              <span className="text-bc-muted">Rottami</span>
              <span className="font-mono text-bc-amber text-xs">{crawlerSystem?.scrap ?? '—'}</span>
            </div>
            <div className="h-1 rounded-full bg-bc-border overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${scrapPct}%`, background: 'var(--bc-amber)', boxShadow: '0 0 6px var(--bc-amber)' }} />
            </div>
          </div>

          <div className="flex justify-between font-sans text-xs pt-1">
            <span className="text-bc-muted">Piloti</span>
            <span className="font-mono text-bc-blue text-xs">{crawlerSystem?.engineers ?? '—'}</span>
          </div>
        </div>
      </div>

      {isOperator && (
        <div className="px-5 py-3 border-t border-bc-border">
          <span className="font-sans text-xs text-bc-amber/60">Modalità operatore attiva</span>
        </div>
      )}
    </aside>
  )
}
