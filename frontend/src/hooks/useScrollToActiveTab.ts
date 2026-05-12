import { useRef, useEffect } from 'react'

export function useScrollToActiveTab(dep: unknown) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (tabsRef.current && activeTabRef.current) {
      activeTabRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [dep])

  return { tabsRef, activeTabRef }
}
