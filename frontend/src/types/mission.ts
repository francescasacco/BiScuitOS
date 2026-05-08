export type MissionStatus = 'active' | 'pending' | 'completed' | 'failed' | 'classified'

export interface MissionSquad {
  number: number
  name: string
  location: string
  type: string
  description: string
  status: string | string[]
}

export interface MissionCharacter {
  alignment: 'ally' | 'contract' | 'hostile' | 'neutral'
  name: string
  role: string
  description: string
}

export interface MissionContract {
  name: string
  client: string
  objective: string
  reward: string
  consequence: string
}

export interface MissionAsset {
  name: string
  category: string
  classification?: string
}

export interface MissionReport {
  date?: string
  place?: string
  intel?: string[]
  squads?: MissionSquad[]
  discoveries?: { icon: string; title: string; description: string }[]
  characters?: MissionCharacter[]
  contracts?: MissionContract[]
  contractsIncompatible?: boolean
  assets?: MissionAsset[]
  priorities?: string[]
}

export interface Mission {
  id: string
  title: string
  status: MissionStatus
  summary?: string
  reward?: string
  map_x?: number
  map_y?: number
  report?: MissionReport | null
  created_at: string
}

export type MissionFormData = {
  title: string
  status: MissionStatus
  summary?: string
  reward?: string
  map_x?: number
  map_y?: number
}
