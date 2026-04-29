import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { BootScreen } from './components/layout/BootScreen'
import { useOSStore } from './store/useOSStore'
import { pilotService } from './services/pilotService'
import { systemService } from './services/systemService'
import { journalService } from './services/journalService'
import { missionService } from './services/missionService'

export function App() {
  const {
    isBooting,
    setPilots,
    setCrawlerSystem,
    setJournalEntries,
    setMissions,
  } = useOSStore()

  useEffect(() => {
    async function loadData() {
      try {
        const [pilots, system, journal, missions] = await Promise.all([
          pilotService.getAll().catch(() => []),
          systemService.initialize().catch(() => null),
          journalService.getAll().catch(() => []),
          missionService.getAll().catch(() => []),
        ])
        setPilots(pilots)
        setCrawlerSystem(system)
        setJournalEntries(journal)
        setMissions(missions)
      } catch (err) {
        console.warn('[BC-OS] Data load failed — offline mode active', err)
      }
    }
    loadData()
  }, [setPilots, setCrawlerSystem, setJournalEntries, setMissions])

  return (
    <>
      {isBooting && <BootScreen />}
      <RouterProvider router={router} />
    </>
  )
}
