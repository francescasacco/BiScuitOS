import { useNavigate, useLocation } from 'react-router-dom'
import { useOSStore } from '@/store/useOSStore'
import { OS_VERSION } from '@/config'
import { Diamond, Users, Crosshair, Package, Zap } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/',         label: 'Feed',        sub: 'principale',          lucide: Diamond   },
  { path: '/crew',     label: 'Equipaggio',  sub: 'registro',            lucide: Users     },
  { path: '/missions', label: 'Missioni',    sub: 'nucleo esplorazioni', lucide: Crosshair },
  { path: '/hangar',   label: 'Hangar',      sub: 'inventario',          lucide: Package   },
]

const OPERATOR_ITEMS = [
  { path: '/core', label: 'Core System', sub: 'operatore', lucide: Zap },
]

export function Sidebar() {
  const { isOperator, crawlerSystem, sidebarOpen, setSidebarOpen, pilots, missions } = useOSStore()
  const navigate  = useNavigate()
  const location  = useLocation()


  const activeMissions = Array.isArray(missions) ? missions.filter((m) => m.status === 'active').length : 0
  const pilotCount     = Array.isArray(pilots) ? pilots.length : 0

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const handleNav = (path: string) => {
    navigate(path)
    setSidebarOpen(false)
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
          Pannelli
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
                  : 'text-bc-text/70 hover:bg-bc-panel hover:text-bc-text'}
              `}
            >
              <span className={`shrink-0 flex items-center ${active ? 'text-bc-accent' : 'text-bc-accent/50 group-hover:text-bc-accent'}`}>
                <item.lucide size={14} strokeWidth={1.5} />
              </span>
              <div className="flex-1 min-w-0">
                <div className={`font-sans text-sm font-medium ${active ? 'text-bc-text' : ''}`}>
                  {item.label}
                </div>
                <div className="font-sans text-xs text-bc-muted/90">{item.sub}</div>
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
              <div className="h-px bg-bc-track" />
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
                  <span className="shrink-0 flex items-center">
                    <item.lucide size={14} strokeWidth={1.5} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-sm font-medium">{item.label}</div>
                    <div className="font-sans text-xs text-bc-muted/90">{item.sub}</div>
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
          <div className="flex justify-between font-sans text-xs">
            <span className="text-bc-muted">Rottami</span>
            <span className="font-mono text-bc-amber text-xs">{crawlerSystem?.scrap ?? '—'}</span>
          </div>

          <div className="flex justify-between font-sans text-xs pt-1">
            <span className="text-bc-muted">Rep. Tecnico</span>
            <span className="font-mono text-bc-blue text-xs">{crawlerSystem?.engineers ?? '—'}</span>
          </div>

          <div className="flex justify-between font-sans text-xs pt-1">
            <span className="text-bc-muted">Piloti</span>
            <span className="font-mono text-bc-green text-xs">{pilots.length}</span>
          </div>
        </div>
      </div>

      {isOperator && (
        <div className="px-5 py-3 border-t border-bc-border">
          <span className="font-mono text-xs text-bc-amber/60 uppercase tracking-widest">BISCUIT // OPERATORE</span>
        </div>
      )}
    </aside>
  )
}
