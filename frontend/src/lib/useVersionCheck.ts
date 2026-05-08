import { useEffect, useState } from 'react'

const POLL_INTERVAL = 5 * 60 * 1000 // 5 minuti

async function fetchVersion(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.version ?? null
  } catch {
    return null
  }
}

export function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    if (!isMobile) return

    let currentVersion: string | null = null

    const check = async () => {
      const version = await fetchVersion()
      if (!version) return
      if (currentVersion === null) {
        currentVersion = version
      } else if (version !== currentVersion) {
        setUpdateAvailable(true)
      }
    }

    check()
    const interval = setInterval(check, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  return updateAvailable
}
