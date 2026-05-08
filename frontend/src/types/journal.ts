export type JournalEntryType =
  | 'event'
  | 'mission'
  | 'system'
  | 'pilot_registration'
  | 'override'
  | 'alert'
  | 'pilot_note'
  | 'trade'

export interface JournalEntry {
  id: string
  title: string
  content: string
  type: JournalEntryType
  author?: string
  created_at: string
}

export type JournalFormData = Omit<JournalEntry, 'id' | 'created_at'>
