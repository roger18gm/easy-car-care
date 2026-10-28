import { useEffect, useState } from 'preact/hooks'
import { getSession } from '../lib/auth'
import { COPY } from '../lib/copy'
import { listVehicleLogs } from '../lib/logs'
import { dueSentences, groupByStatus, healthLabel, localToday, statusLabel } from '../lib/schedule'
import { listTasks } from '../lib/tasks'
import type { LogListItem, TaskRecord, VehicleRecord } from '../lib/types'
import { listVehicles, readStoredVehicleId, resolveActiveVehicleId, storeVehicleId } from '../lib/vehicles'

export function DashboardIsland() {
  const [ready, setReady] = useState(false)
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([])
  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null)
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [logs, setLogs] = useState<LogListItem[]>([])
  const [message, setMessage] = useState('')
  const today = localToday()

  async function loadVehicle(record: VehicleRecord) {
    storeVehicleId(record.id)
    setVehicle(record)
    const taskResult = await listTasks(record.id, record.current_mileage, today)
    const logResult = await listVehicleLogs(record.id, 5)
    if (!taskResult.ok) setMessage(taskResult.message)
    else setMessage(taskResult.data.length === 0 ? COPY.planMissing : '')
    setTasks(taskResult.ok ? taskResult.data : [])
    setLogs(logResult.ok ? logResult.data : [])
  }

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return
      const result = await listVehicles()
      if (!result.ok) {
        setMessage(result.message)
        setReady(true)
        return
      }
      setVehicles(result.data)
      const activeId = resolveActiveVehicleId(readStoredVehicleId(), result.data)
      const active = result.data.find((item) => item.id === activeId) ?? null
      if (active) await loadVehicle(active)
      setReady(true)
    })
  }, [])

  if (!ready) return null
  if (!vehicle) {
    return (
      <div class="stack">
        <h1>Dashboard</h1>
        <p>{COPY.addVehiclePrompt}</p>
        <a class="button" href="/vehicles/new">Add vehicle</a>
      </div>
    )
  }
  const groups = groupByStatus(tasks)
  const health = tasks.length === 0 ? '' : healthLabel(tasks.map((task) => task.status))
  return (
    <div class="stack">
      <h1>Dashboard</h1>
      <label for="vehicle-switcher">Vehicle</label>
      <select id="vehicle-switcher" value={vehicle.id} onChange={(event) => {
        const next = vehicles.find((item) => item.id === (event.currentTarget as HTMLSelectElement).value)
        if (next) void loadVehicle(next)
      }}>
        {vehicles.map((item) => <option key={item.id} value={item.id}>{item.year} {item.make} {item.model}</option>)}
      </select>
      <p>{vehicle.current_mileage.toLocaleString('en-US')} miles</p>
      {health ? <p class="status">{health}</p> : null}
      {message ? <p class="error" role="alert">{message}</p> : null}
      {groups.overdue.length === 0 && groups.due.length === 0 && tasks.length > 0 ? <p>{COPY.nothingDueSoon}</p> : null}
      {groups.overdue.map((task) => (
        <article class="card" key={task.id}>
          <a href={`/tasks/detail?id=${task.id}`}>{task.name}</a>
          <p class="status">{statusLabel(task.status)}</p>
          <p>{dueSentences({ currentMileage: vehicle.current_mileage, today, nextDueMileage: task.next_due_mileage, nextDueDate: task.next_due_date }).join(' ')}</p>
        </article>
      ))}
      {groups.due.map((task) => (
        <article class="card" key={task.id}>
          <a href={`/tasks/detail?id=${task.id}`}>{task.name}</a>
          <p class="status">{statusLabel(task.status)}</p>
          <p>{dueSentences({ currentMileage: vehicle.current_mileage, today, nextDueMileage: task.next_due_mileage, nextDueDate: task.next_due_date }).join(' ')}</p>
        </article>
      ))}
      <h2>Recent activity</h2>
      {logs.length === 0 ? <p>{COPY.noHistory}</p> : logs.map((log) => (
        <p key={log.id}>{log.task_name} — {log.completed_date} — {log.completed_mileage.toLocaleString('en-US')} miles</p>
      ))}
    </div>
  )
}
