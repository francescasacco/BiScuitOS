import { create } from 'zustand'
import type { Pilot } from '@/types/pilot'
import type { CrawlerSystem } from '@/types/system'
import type { JournalEntry } from '@/types/journal'
import type { Mission } from '@/types/mission'
import type { TaskBoardItem } from '@/types/taskBoard'

interface OSStore {
  isOperator: boolean
  setIsOperator: (value: boolean) => void

  pilots: Pilot[]
  setPilots: (pilots: Pilot[]) => void
  addPilot: (pilot: Pilot) => void
  updatePilot: (pilot: Pilot) => void
  removePilot: (id: string) => void

  crawlerSystem: CrawlerSystem | null
  setCrawlerSystem: (system: CrawlerSystem | null) => void

  journalEntries: JournalEntry[]
  setJournalEntries: (entries: JournalEntry[]) => void
  addJournalEntry: (entry: JournalEntry) => void

  missions: Mission[]
  setMissions: (missions: Mission[]) => void
  addMission: (mission: Mission) => void
  updateMission: (mission: Mission) => void

  taskBoardItems: TaskBoardItem[]
  setTaskBoardItems: (items: TaskBoardItem[]) => void
  addTaskBoardItem: (item: TaskBoardItem) => void
  updateTaskBoardItem: (item: TaskBoardItem) => void
  removeTaskBoardItem: (id: string) => void

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
    set((state) => ({ pilots: state.pilots.map((p) => (p.id === pilot.id ? pilot : p)) })),
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
    set((state) => ({ missions: state.missions.map((m) => (m.id === mission.id ? mission : m)) })),

  taskBoardItems: [],
  setTaskBoardItems: (items) => set({ taskBoardItems: items }),
  addTaskBoardItem: (item) =>
    set((state) => ({ taskBoardItems: [...state.taskBoardItems, item] })),
  updateTaskBoardItem: (item) =>
    set((state) => ({ taskBoardItems: state.taskBoardItems.map((t) => (t.id === item.id ? item : t)) })),
  removeTaskBoardItem: (id) =>
    set((state) => ({ taskBoardItems: state.taskBoardItems.filter((t) => t.id !== id) })),

  isBooting: true,
  setIsBooting: (value) => set({ isBooting: value }),
  sidebarOpen: false,
  setSidebarOpen: (value) => set({ sidebarOpen: value }),
}))
