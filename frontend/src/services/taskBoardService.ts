import { supabase } from '@/lib/supabaseClient'
import type { TaskBoardItem } from '@/types/taskBoard'

export const taskBoardService = {
  async getAll(): Promise<TaskBoardItem[]> {
    const { data, error } = await supabase
      .from('task_board_items')
      .select('*')
      .order('position', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async create(text: string, position: number): Promise<TaskBoardItem> {
    const { data, error } = await supabase
      .from('task_board_items')
      .insert({ text, position })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async toggleCompleted(id: string, completed: boolean): Promise<TaskBoardItem> {
    const { data, error } = await supabase
      .from('task_board_items')
      .update({ completed })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('task_board_items').delete().eq('id', id)
    if (error) throw error
  },
}
