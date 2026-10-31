import { useEffect, useState } from 'preact/hooks'
import { getSession } from '../lib/auth'
import { COPY, deleteLogQuestion } from '../lib/copy'
import { deleteLog, listVehicleLogs, recalculateTask } from '../lib/logs'
import { localToday } from '../lib/schedule'
import { getTask } from '../lib/tasks'
import type { LogListItem, TaskRecord, VehicleRecord } from '../lib/types'
import { getVehicle } from '../lib/vehicles'

export function HistoryIsland() {
  const [vehicleId, setVehicleId] = useState('')
  const [ready, setReady] = useState(false)
  const [missing, setMissing] = useState(false)
  const [logs, setLogs] = useState<LogListItem[]>([])
  const [message, setMessage] = useState('')
  const [pendingTask, setPendingTask] = useState<TaskRecord | null>(null)
  const [pendingVehicle, setPendingVehicle] = useState<VehicleRecord | null>(null)

  async function load(id: string) {
    const result = await listVehicleLogs(id)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    setLogs(result.data)
  }

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id') ?? ''
    setVehicleId(id)
    getSession().then(async (session) => {
      if (!session) return
      if (!id) {
        setMissing(true)
        setReady(true)
        return
      }
      const vehicle = await getVehicle(id)
      if (!vehicle.ok) {
        setMissing(true)
        setReady(true)
        return
      }
      await load(id)
      setReady(true)
    })
  }, [])

  async function onDelete(log: LogListItem) {
    if (!window.confirm(deleteLogQuestion(log.task_name))) return
    const vehicle = await getVehicle(vehicleId)
    const task = await getTask(log.maintenance_task_id)
    if (!vehicle.ok || !task.ok) {
      setMessage(COPY.genericError)
      return
    }
    const result = await deleteLog(log.id, task.data, vehicle.data, localToday())
    if (!result.ok) {
      setMessage(result.message)
      if (result.message === COPY.scheduleNeedsUpdate) {
        setPendingTask(task.data)
        setPendingVehicle(vehicle.data)
      }
      return
    }
    setPendingTask(null)
    setPendingVehicle(null)
    setMessage('')
    await load(vehicleId)
  }

  async function onRetrySchedule() {
    if (!pendingTask || !pendingVehicle) return
    const result = await recalculateTask(pendingTask, pendingVehicle, localToday())
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    setPendingTask(null)
    setPendingVehicle(null)
    setMessage('')
    await load(vehicleId)
  }

  if (!ready) return null
  if (missing) return <p>{COPY.unavailable} <a href="/vehicles">Back to vehicles</a></p>
  return (
    <div class="stack">
      <h1>History</h1>
      {message ? <p class="error" role="alert">{message}</p> : null}
      {pendingTask ? <button type="button" onClick={() => void onRetrySchedule()}>Try again</button> : null}
      {logs.length === 0 ? <p>{COPY.noHistory}</p> : null}
      {logs.map((log) => (
        <article class="card" key={log.id}>
          <h2>{log.task_name}</h2>
          <p>{log.completed_date}</p>
          <p>{log.completed_mileage.toLocaleString('en-US')} miles</p>
          <p>{log.notes}</p>
          <a href={`/tasks/log?id=${log.maintenance_task_id}&log=${log.id}`}>Edit</a>
          <button style={{marginLeft: "8px"}} type="button" onClick={() => void onDelete(log)}>Delete</button>
        </article>
      ))}
    </div>
  )
}
