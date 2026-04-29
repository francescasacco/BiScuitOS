export interface CrawlerSystem {
  id: string
  scrap: number
  engineers: number
  fuel: number
  merchant_bridge?: string
  repair_status?: string
  active_alerts?: string
  system_notes?: string
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
