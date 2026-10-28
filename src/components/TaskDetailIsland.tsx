import { useEffect, useState } from 'preact/hooks'
import { getSession } from '../lib/auth'
import { COPY } from '../lib/copy'
import { listVehicleLogs } from '../lib/logs'
import { dueSentences, localToday, statusLabel } from '../lib/schedule'
import { getTask } from '../lib/tasks'
import type { LogListItem, TaskRecord } from '../lib/types'
import { getVehicle } from '../lib/vehicles'

function intervalText(miles: number | null, months: number | null): string {
  const parts: string[] = []
  if (miles != null) parts.push(`Every ${miles.toLocaleString('en-US')} miles`)
  if (months != null) parts.push(months === 1 ? 'Every 1 month' : `Every ${months} months`)
  return parts.join('. ')
}

export function TaskDetailIsland() {
  const [ready, setReady] = useState(false)
  const [missing, setMissing] = useState(false)
  const [task, setTask] = useState<TaskRecord | null>(null)
  const [mileage, setMileage] = useState(0)
  const [logs, setLogs] = useState<LogListItem[]>([])
  const today = localToday()

  useEffect(() => {
    const taskId = new URLSearchParams(window.location.search).get('id') ?? ''
    getSession().then(async (session) => {
      if (!session) return
      if (!taskId) {
        setMissing(true)
        setReady(true)
        return
      }
      const taskResult = await getTask(taskId)
      if (!taskResult.ok) {
        setMissing(true)
        setReady(true)
        return
      }
      const vehicleResult = await getVehicle(taskResult.data.vehicle_id)
      if (!vehicleResult.ok) {
        setMissing(true)
        setReady(true)
        return
      }
      const logResult = await listVehicleLogs(vehicleResult.data.id)
      setTask(taskResult.data)
      setMileage(vehicleResult.data.current_mileage)
      setLogs(logResult.ok ? logResult.data.filter((log) => log.maintenance_task_id === taskId) : [])
      setReady(true)
    })
  }, [])

  if (!ready) return null
  if (missing || !task) return <p>{COPY.unavailable} <a href="/vehicles">Back to vehicles</a></p>
  return (
    <div class="stack">
      <h1>{task.name}</h1>
      <p>{task.description}</p>
      <p class="status">{statusLabel(task.status)}</p>
      <p>{intervalText(task.interval_miles, task.interval_months)}</p>
      <p>{dueSentences({
        currentMileage: mileage,
        today,
        nextDueMileage: task.next_due_mileage,
        nextDueDate: task.next_due_date,
      }).join(' ')}</p>
      <a class="button" href={`/tasks/log?id=${task.id}`}>Log completion</a>
      {logs.length === 0 ? <p>{COPY.noHistory}</p> : logs.map((log) => (
        <article class="card" key={log.id}>
          <p>{log.completed_date}</p>
          <p>{log.completed_mileage.toLocaleString('en-US')} miles</p>
        </article>
      ))}
    </div>
  )
}
