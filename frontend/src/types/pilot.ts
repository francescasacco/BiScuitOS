export interface Pilot {
  id: string
  identificativo: string
  aspetto?: string
  classe: string
  motto_attivato?: string
  background?: string
  cimelio?: string
  mech_nome?: string
  mech_info?: string
  mech_sistemi?: string
  mech_moduli?: string
  mech_status?: string
  role: 'pilot' | 'operator'
  created_at: string
  updated_at: string
}

export type PilotFormData = Omit<Pilot, 'id' | 'created_at' | 'updated_at' | 'role'>

export const CLASSI_PILOTA = [
  'Salvager',
  'Outrider',
  'Mechwright',
  'Fixer',
  'Hacker',
  'Mercenary',
] as const
