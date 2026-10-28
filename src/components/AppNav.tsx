import { useEffect, useState } from 'preact/hooks'

export function AppNav() {
  const [historyHref, setHistoryHref] = useState('/vehicles')

  useEffect(() => {
    const stored = localStorage.getItem('easycarcare.activeVehicleId')
    if (stored) setHistoryHref(`/vehicles/history?id=${stored}`)
  }, [])

  return (
    <nav class="nav" aria-label="Primary">
      <a href="/dashboard">Dashboard</a>
      <a href="/vehicles">Vehicles</a>
      <a href={historyHref}>History</a>
    </nav>
  )
}
