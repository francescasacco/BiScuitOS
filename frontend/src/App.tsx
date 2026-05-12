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
import { supabase } from './lib/supabaseClient'
import type { Pilot } from './types/pilot'
import type { JournalEntry } from './types/journal'
import type { Mission } from './types/mission'
import type { TradeOffer } from './types/tradeBoard'
import type { CrawlerSystem } from './types/system'

export function App() {
  const {
    isBooting,
    setPilots,
    setCrawlerSystem,
    setJournalEntries,
    setMissions,
    setTradeOffers,
    addPilot,
    updatePilot,
    removePilot,
    addJournalEntry,
    removeJournalEntry,
    addMission,
    updateMission,
    removeMission,
    addTradeOffer,
    removeTradeOffer,
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

    const channel = supabase
      .channel('bc-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pilots' }, payload => {
        addPilot(payload.new as Pilot)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pilots' }, payload => {
        updatePilot(payload.new as Pilot)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pilots' }, payload => {
        removePilot(payload.old.id as string)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'journal_stream' }, payload => {
        addJournalEntry(payload.new as JournalEntry)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'journal_stream' }, payload => {
        removeJournalEntry(payload.old.id as string)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'missions' }, payload => {
        addMission(payload.new as Mission)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'missions' }, payload => {
        updateMission(payload.new as Mission)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'missions' }, payload => {
        removeMission(payload.old.id as string)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trade_board' }, payload => {
        addTradeOffer(payload.new as TradeOffer)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'trade_board' }, payload => {
        removeTradeOffer(payload.old.id as string)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'crawler_system' }, payload => {
        setCrawlerSystem(payload.new as CrawlerSystem)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [setPilots, setCrawlerSystem, setJournalEntries, setMissions, setTradeOffers, addPilot, updatePilot, removePilot, addJournalEntry, removeJournalEntry, addMission, updateMission, removeMission, addTradeOffer, removeTradeOffer])

  return (
    <>
      {isBooting && <BootScreen />}
      <RouterProvider router={router} />
    </>
  )
}
