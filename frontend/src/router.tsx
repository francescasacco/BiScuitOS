import { createBrowserRouter } from 'react-router-dom'
import { OSFrame } from '@/components/layout/OSFrame'
import { OSMainPage } from '@/pages/OSMainPage'
import { CrewInterface } from '@/pages/CrewInterface'
import { MissionsInterface } from '@/pages/MissionsInterface'
import { CoreSystemInterface } from '@/pages/CoreSystemInterface'
import { HangarInterface } from '@/pages/HangarInterface'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <OSFrame />,
    children: [
      { index: true, element: <OSMainPage /> },
      { path: 'crew', element: <CrewInterface /> },
      { path: 'missions', element: <MissionsInterface /> },
      { path: 'hangar', element: <HangarInterface /> },
      { path: 'core', element: <CoreSystemInterface /> },
    ],
  },
])
