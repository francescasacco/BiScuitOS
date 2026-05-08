import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { useOSStore } from '@/store/useOSStore'
import { audioManager } from '@/lib/audioManager'

export function OSFrame() {
  const { sidebarOpen, setSidebarOpen, isOperator } = useOSStore()

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

      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar />
        <main className="flex-1 overflow-hidden min-h-0 pb-6">
          <Outlet />
        </main>
        <div className="shrink-0 flex justify-end pr-4 pb-1.5">
          <span className="font-mono text-[10px] text-bc-accent/80 select-none">Made by @FrancescaSacco</span>
        </div>
      </div>

    </div>
  )
}
