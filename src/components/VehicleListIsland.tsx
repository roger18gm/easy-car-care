import { useEffect, useState } from 'preact/hooks'
import { getSession } from '../lib/auth'
import { COPY, deleteVehicleQuestion } from '../lib/copy'
import { clearStoredVehicleId, deleteVehicle, listVehicles, readStoredVehicleId } from '../lib/vehicles'
import type { VehicleRecord } from '../lib/types'

export function VehicleListIsland() {
  const [ready, setReady] = useState(false)
  const [vehicles, setVehicles] = useState<VehicleRecord[] | null>(null)
  const [message, setMessage] = useState('')

  async function load() {
    const result = await listVehicles()
    if (!result.ok) {
      setMessage(result.message)
      setVehicles([])
      return
    }
    setVehicles(result.data)
  }

  useEffect(() => {
    getSession().then((session) => {
      if (!session) return
      setReady(true)
      void load()
    })
  }, [])

  async function onDelete(vehicle: VehicleRecord) {
    if (!window.confirm(deleteVehicleQuestion(vehicle.year, vehicle.make, vehicle.model))) return
    const result = await deleteVehicle(vehicle.id)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    if (readStoredVehicleId() === vehicle.id) clearStoredVehicleId()
    window.location.assign('/vehicles')
  }

  if (!ready || vehicles == null) return null
  return (
    <div class="stack">
      <a class="button" href="/vehicles/new">Add vehicle</a>
      {message ? <p class="error" role="alert">{message}</p> : null}
      {vehicles.length === 0 ? <p>{COPY.noVehicles}</p> : null}
      {vehicles.map((vehicle) => (
        <article class="card" key={vehicle.id}>
          <a href={`/vehicles/detail?id=${vehicle.id}`}>{vehicle.year} {vehicle.make} {vehicle.model}</a>
          <p>{vehicle.current_mileage.toLocaleString('en-US')} miles</p>
          <button type="button" onClick={() => void onDelete(vehicle)}>Delete</button>
        </article>
      ))}
    </div>
  )
}
