export interface CrawlerSection {
  name: string
  detail?: string
  status: 'active' | 'empty' | 'damaged'
}

export interface HangarItem {
  name: string
  category: 'Sistema' | 'Modulo' | 'Telaio' | 'Altro'
  tec?: number | null
  quantity: number
  status: 'normale' | 'danneggiato' | 'distrutto'
  notes?: string
}

export interface CrawlerSystem {
  id: string
  scrap: number
  engineers: number
  fuel: number
  crawler_name?: string
  crawler_type?: string
  ps_current?: number
  ps_max?: number
  enhancement_current?: number
  enhancement_max?: number
  maintenance_cost?: number
  merchant_bridge?: string
  repair_status?: string
  active_alerts?: string
  system_notes?: string
  sections?: CrawlerSection[]
  inventory?: HangarItem[]
  updated_at: string
}

export type SystemUpdateData = Partial<Omit<CrawlerSystem, 'id' | 'updated_at'>>

export type AlertLevel = 'info' | 'warning' | 'critical' | 'nominal'

export interface SystemAlert {
  id: string
  level: AlertLevel
  message: string
  timestamp: string
}
