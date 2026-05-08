import type { MissionStatus, MissionFormData } from '@/types/mission'

export const STATUS_COLORS: Record<MissionStatus, string> = {
  active:     'text-bc-green border-bc-green',
  pending:    'text-bc-amber border-bc-amber',
  completed:  'text-cyan-400 border-cyan-400',
  failed:     'text-bc-red border-bc-red',
  classified: 'text-bc-blue border-bc-blue',
}

export const STATUS_LABELS: Record<MissionStatus, string> = {
  active:     'ATTIVA',
  pending:    'IN ATTESA',
  completed:  'COMPLETATA',
  failed:     'FALLITA',
  classified: 'CLASSIFICATA',
}

export const MARKER_BORDER: Record<MissionStatus, string> = {
  active:     'border-bc-green bg-green-700 shadow-[0_0_8px_var(--bc-green)]',
  pending:    'border-bc-amber bg-amber-700 shadow-[0_0_6px_var(--bc-amber)]',
  completed:  'border-cyan-400 bg-cyan-700 shadow-[0_0_6px_theme(colors.cyan.400)]',
  failed:     'border-bc-red bg-red-700 shadow-[0_0_6px_var(--bc-red)]',
  classified: 'border-bc-blue bg-blue-700 shadow-[0_0_6px_var(--bc-blue)]',
}

export const MARKER_FILL_HEX: Record<MissionStatus, string> = {
  active:     '#15803d',
  pending:    '#b45309',
  completed:  '#0e7490',
  failed:     '#b91c1c',
  classified: '#1d4ed8',
}

export const STATUS_DOT: Record<MissionStatus, string> = {
  active:     'bg-bc-green shadow-[0_0_5px_var(--bc-green)]',
  pending:    'bg-bc-amber shadow-[0_0_5px_var(--bc-amber)]',
  completed:  'bg-cyan-400',
  failed:     'bg-bc-red shadow-[0_0_5px_var(--bc-red)]',
  classified: 'bg-bc-blue shadow-[0_0_5px_var(--bc-blue)]',
}

export const ZOOM_STEPS = [1, 1.5, 2, 2.5]

export const EMPTY_FORM: MissionFormData = { title: '', status: 'pending', summary: '', reward: '' }

export const ICON_MAP: Record<string, string> = {
  biohazard:        'Biohazard',
  zap:              'Zap',
  diamond:          'Diamond',
  'alert-triangle': 'AlertTriangle',
  sword:            'Sword',
  wrench:           'Wrench',
  star:             'Star',
  eye:              'Eye',
  shield:           'Shield',
  flame:            'Flame',
  package:          'Package',
}
