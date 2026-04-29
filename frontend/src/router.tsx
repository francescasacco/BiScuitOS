import { createBrowserRouter } from 'react-router-dom'
import { OSFrame } from '@/components/layout/OSFrame'
import { OSMainPage } from '@/pages/OSMainPage'
import { CrewInterface } from '@/pages/CrewInterface'
import { JournalInterface } from '@/pages/JournalInterface'
import { MissionsInterface } from '@/pages/MissionsInterface'
import { CoreSystemInterface } from '@/pages/CoreSystemInterface'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <OSFrame />,
    children: [
      { index: true, element: <OSMainPage /> },
      { path: 'crew', element: <CrewInterface /> },
      { path: 'journal', element: <JournalInterface /> },
      { path: 'missions', element: <MissionsInterface /> },
      { path: 'core', element: <CoreSystemInterface /> },
    ],
  },
])
