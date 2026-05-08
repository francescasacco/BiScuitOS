import { supabase } from '@/lib/supabaseClient'
import type { TradeOffer, TradeOfferFormData } from '@/types/tradeBoard'

export const tradeBoardService = {
  async getAll(): Promise<TradeOffer[]> {
    const { data, error } = await supabase
      .from('trade_board')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async create(form: TradeOfferFormData): Promise<TradeOffer> {
    const { data, error } = await supabase
      .from('trade_board')
      .insert(form)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('trade_board').delete().eq('id', id)
    if (error) throw error
  },
}
