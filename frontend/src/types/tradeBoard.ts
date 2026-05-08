export type TradeOfferType = 'offerta' | 'richiesta'

export interface TradeOffer {
  id: string
  pilot_name: string
  type: TradeOfferType
  item_name: string
  item_category: 'Sistema' | 'Modulo' | 'Altro'
  notes?: string
  archived?: boolean
  created_at: string
}

export type TradeOfferFormData = Omit<TradeOffer, 'id' | 'created_at'>
