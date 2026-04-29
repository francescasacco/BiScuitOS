import { create } from 'zustand'
import type { Pilot } from '@/types/pilot'
import type { CrawlerSystem } from '@/types/system'
import type { JournalEntry } from '@/types/journal'
import type { Mission } from '@/types/mission'

interface OSStore {
  // Auth / operator
  isOperator: boolean
  setIsOperator: (value: boolean) => void

  // Pilots
  pilots: Pilot[]
  setPilots: (pilots: Pilot[]) => void
  addPilot: (pilot: Pilot) => void
  updatePilot: (pilot: Pilot) => void
  removePilot: (id: string) => void

  // System
  crawlerSystem: CrawlerSystem | null
  setCrawlerSystem: (system: CrawlerSystem | null) => void

  // Journal
  journalEntries: JournalEntry[]
  setJournalEntries: (entries: JournalEntry[]) => void
  addJournalEntry: (entry: JournalEntry) => void

  // Missions
  missions: Mission[]
  setMissions: (missions: Mission[]) => void
  addMission: (mission: Mission) => void
  updateMission: (mission: Mission) => void

  // UI state
  isBooting: boolean
  setIsBooting: (value: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (value: boolean) => void
}

export const useOSStore = create<OSStore>((set) => ({
  isOperator: false,
  setIsOperator: (value) => set({ isOperator: value }),

  pilots: [],
  setPilots: (pilots) => set({ pilots }),
  addPilot: (pilot) => set((state) => ({ pilots: [...state.pilots, pilot] })),
  updatePilot: (pilot) =>
    set((state) => ({
      pilots: state.pilots.map((p) => (p.id === pilot.id ? pilot : p)),
    })),
  removePilot: (id) =>
    set((state) => ({ pilots: state.pilots.filter((p) => p.id !== id) })),

  crawlerSystem: null,
  setCrawlerSystem: (system) => set({ crawlerSystem: system }),

  journalEntries: [],
  setJournalEntries: (entries) => set({ journalEntries: entries }),
  addJournalEntry: (entry) =>
    set((state) => ({ journalEntries: [entry, ...state.journalEntries] })),

  missions: [],
  setMissions: (missions) => set({ missions }),
  addMission: (mission) =>
    set((state) => ({ missions: [mission, ...state.missions] })),
  updateMission: (mission) =>
    set((state) => ({
      missions: state.missions.map((m) => (m.id === mission.id ? mission : m)),
    })),

  isBooting: true,
  setIsBooting: (value) => set({ isBooting: value }),
  sidebarOpen: false,
  setSidebarOpen: (value) => set({ sidebarOpen: value }),
}))
