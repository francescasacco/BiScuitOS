import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { useOSStore } from '@/store/useOSStore'
import { audioManager } from '@/lib/audioManager'
import { useVersionCheck } from '@/lib/useVersionCheck'
import { RefreshCw } from 'lucide-react'

export function OSFrame() {
  const { sidebarOpen, setSidebarOpen, isOperator } = useOSStore()
  const updateAvailable = useVersionCheck()

  useEffect(() => {
    if (window.innerWidth >= 768) setSidebarOpen(true)
  }, [setSidebarOpen])

  useEffect(() => {
    if (isOperator) audioManager.start()
    else audioManager.stop()
  }, [isOperator])

  return (
    <div className="crt-overlay h-[100dvh] flex overflow-hidden bg-bc-black">
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', left: -9999, pointerEvents: 'none' }}>
        <div id="operator-yt-audio" />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {updateAvailable && (
        <div className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-between gap-3 px-4 py-2.5 bg-bc-amber text-bc-black font-mono text-xs font-bold md:hidden">
          <span>Nuova versione disponibile!</span>
          <button
            className="flex items-center gap-1.5 border border-bc-black/30 px-2 py-1 rounded"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={11} strokeWidth={2.5} /> AGGIORNA
          </button>
        </div>
      )}

      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar />
        <main className="flex-1 overflow-hidden min-h-0">
          <Outlet />
        </main>
      </div>

    </div>
  )
}
