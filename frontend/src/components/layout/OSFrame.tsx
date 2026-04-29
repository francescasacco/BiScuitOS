import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { useOSStore } from '@/store/useOSStore'

export function OSFrame() {
  const { sidebarOpen, setSidebarOpen } = useOSStore()

  useEffect(() => {
    if (window.innerWidth >= 768) setSidebarOpen(true)
  }, [setSidebarOpen])

  return (
    <div className="crt-overlay h-screen flex overflow-hidden bg-bc-black">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — colonna sinistra, altezza intera */}
      <Sidebar />

      {/* Colonna destra: header + contenuto */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar />
        <main className="flex-1 overflow-hidden min-h-0">
          <Outlet />
        </main>
      </div>

    </div>
  )
}
