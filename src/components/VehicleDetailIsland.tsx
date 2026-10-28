import { useEffect, useState } from 'preact/hooks'
import { getSession } from '../lib/auth'
import { COPY } from '../lib/copy'
import { dueSentences, groupByStatus, localToday, statusLabel } from '../lib/schedule'
import { listTasks } from '../lib/tasks'
import type { TaskRecord, VehicleRecord } from '../lib/types'
import { getVehicle, retryStarterPlan, updateMileage } from '../lib/vehicles'
import { validateVehicleForm } from '../lib/validation'
import { Field } from './Field'

function TaskGroup({ title, tasks, mileage, today }: { title: string; tasks: TaskRecord[]; mileage: number; today: string }) {
  if (tasks.length === 0) return null
  return (
    <section class="stack">
      <h2>{title}</h2>
      {tasks.map((task) => (
        <article class="card" key={task.id}>
          <a href={`/tasks/detail?id=${task.id}`}>{task.name}</a>
          <p class="status">{statusLabel(task.status)}</p>
          <p>{dueSentences({
            currentMileage: mileage,
            today,
            nextDueMileage: task.next_due_mileage,
            nextDueDate: task.next_due_date,
          }).join(' ')}</p>
        </article>
      ))}
    </section>
  )
}

export function VehicleDetailIsland() {
  const [ready, setReady] = useState(false)
  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null)
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [missing, setMissing] = useState(false)
  const [mileage, setMileage] = useState('')
  const [mileageError, setMileageError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const today = localToday()

  async function load(record: VehicleRecord) {
    const result = await listTasks(record.id, record.current_mileage, today)
    if (!result.ok) {
      setMessage(result.message)
      setTasks([])
      return
    }
    setTasks(result.data)
    if (result.data.length === 0) setMessage(COPY.planMissing)
  }

  useEffect(() => {
    const vehicleId = new URLSearchParams(window.location.search).get('id') ?? ''
    getSession().then(async (session) => {
      if (!session) return
      if (!vehicleId) {
        setMissing(true)
        setReady(true)
        return
      }
      const result = await getVehicle(vehicleId)
      if (!result.ok) {
        setMissing(true)
        setReady(true)
        return
      }
      setVehicle(result.data)
      setMileage(String(result.data.current_mileage))
      await load(result.data)
      setReady(true)
    })
  }, [])

  async function onMileage(event: Event) {
    event.preventDefault()
    if (saving || !vehicle) return
    const result = validateVehicleForm({
      year: String(vehicle.year),
      make: vehicle.make,
      model: vehicle.model,
      mileage,
      vin: vehicle.vin ?? '',
      purchaseDate: vehicle.purchase_date ?? '',
      currentMileage: vehicle.current_mileage,
    })
    setMileageError(result.errors.mileage ?? '')
    if (!result.value) return
    setSaving(true)
    const saved = await updateMileage(vehicle.id, result.value.mileage, today)
    if (!saved.ok) setMessage(saved.message)
    else setMessage('')
    const latest = saved.ok ? saved.data : vehicle
    if (saved.ok) setVehicle(saved.data)
    await load(latest)
    setSaving(false)
  }

  async function onRetry() {
    if (!vehicle || saving) return
    setSaving(true)
    const result = await retryStarterPlan(vehicle, today)
    setMessage(result.ok ? '' : result.message)
    await load(vehicle)
    setSaving(false)
  }

  if (!ready) return null
  if (missing || !vehicle) return <p>{COPY.unavailable} <a href="/vehicles">Back to vehicles</a></p>
  const groups = groupByStatus(tasks)
  return (
    <div class="stack">
      <h1>{vehicle.year} {vehicle.make} {vehicle.model}</h1>
      <p>{vehicle.current_mileage.toLocaleString('en-US')} miles</p>
      <a href={`/vehicles/edit?id=${vehicle.id}`}>Edit vehicle</a>
      <form class="stack" onSubmit={onMileage}>
        <Field id="mileage" label="Update mileage" value={mileage} error={mileageError} onInput={setMileage} />
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Update mileage'}</button>
      </form>
      {message ? <p class="error" role="alert">{message}</p> : null}
      {tasks.length === 0 ? <button type="button" disabled={saving} onClick={() => void onRetry()}>Try again</button> : null}
      <TaskGroup title="Overdue" tasks={groups.overdue} mileage={vehicle.current_mileage} today={today} />
      <TaskGroup title="Due soon" tasks={groups.due} mileage={vehicle.current_mileage} today={today} />
      <TaskGroup title="Upcoming" tasks={groups.upcoming} mileage={vehicle.current_mileage} today={today} />
    </div>
  )
}
