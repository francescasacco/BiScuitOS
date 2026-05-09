import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { BootScreen } from './components/layout/BootScreen'
import { useOSStore } from './store/useOSStore'
import { pilotService } from './services/pilotService'
import { systemService } from './services/systemService'
import { journalService } from './services/journalService'
import { missionService } from './services/missionService'
import { tradeBoardService } from './services/tradeBoardService'

export function App() {
  const {
    isBooting,
    setPilots,
    setCrawlerSystem,
    setJournalEntries,
    setMissions,
    setTradeOffers,
  } = useOSStore()

  useEffect(() => {
    async function loadData() {
      try {
        const [pilots, system, journal, missions, tradeOffers] = await Promise.all([
          pilotService.getAll().catch(() => []),
          systemService.initialize().catch(() => null),
          journalService.getAll().catch(() => []),
          missionService.getAll().catch(() => []),
          tradeBoardService.getAll().catch(() => []),
        ])
        setPilots(pilots)
        setCrawlerSystem(system)
        setJournalEntries(journal)
        setMissions(missions)
        setTradeOffers(tradeOffers)
      } catch (err) {
        console.warn('[BC-OS] Data load failed — offline mode active', err)
      }
    }
    loadData()
  }, [setPilots, setCrawlerSystem, setJournalEntries, setMissions, setTradeOffers])

  return (
    <>
      {isBooting && <BootScreen />}
      <RouterProvider router={router} />
    </>
  )
}
