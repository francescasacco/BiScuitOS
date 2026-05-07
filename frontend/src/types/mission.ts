export type MissionStatus = 'active' | 'pending' | 'completed' | 'failed' | 'classified'

export interface Mission {
  id: string
  title: string
  status: MissionStatus
  summary?: string
  reward?: string
  map_x?: number
  map_y?: number
  created_at: string
}

export type MissionFormData = Omit<Mission, 'id' | 'created_at'>
