import { useEffect, useState } from 'preact/hooks'
import { getSession } from '../lib/auth'
import { COPY } from '../lib/copy'
import { createLog, getLog, recalculateTask, updateLog } from '../lib/logs'
import { localToday } from '../lib/schedule'
import { getTask } from '../lib/tasks'
import type { TaskRecord, VehicleRecord } from '../lib/types'
import { getVehicle } from '../lib/vehicles'
import { validateLogForm } from '../lib/validation'
import { Field } from './Field'

export function LogFormIsland() {
  const [taskId, setTaskId] = useState('')
  const [logId, setLogId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [missing, setMissing] = useState(false)
  const [task, setTask] = useState<TaskRecord | null>(null)
  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null)
  const [completedDate, setCompletedDate] = useState(localToday())
  const [mileage, setMileage] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<{ completedDate?: string; mileage?: string; cost?: string }>({})
  const [formError, setFormError] = useState('')
  const [schedulePending, setSchedulePending] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id') ?? ''
    const existingLogId = params.get('log')
    setTaskId(id)
    setLogId(existingLogId)
    getSession().then(async (session) => {
      if (!session) return
      if (!id) {
        setMissing(true)
        setReady(true)
        return
      }
      const taskResult = await getTask(id)
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
      setTask(taskResult.data)
      setVehicle(vehicleResult.data)
      setMileage(String(vehicleResult.data.current_mileage))
      if (existingLogId) {
        const logResult = await getLog(existingLogId)
        if (!logResult.ok || logResult.data.maintenance_task_id !== id) {
          setMissing(true)
          setReady(true)
          return
        }
        setCompletedDate(logResult.data.completed_date)
        setMileage(String(logResult.data.completed_mileage))
        setCost(logResult.data.cost_cents == null ? '' : (logResult.data.cost_cents / 100).toFixed(2))
        setNotes(logResult.data.notes ?? '')
      }
      setReady(true)
    })
  }, [])

  async function onSubmit(event: Event) {
    event.preventDefault()
    if (saving || !task || !vehicle) return
    const today = localToday()
    const result = validateLogForm({ completedDate, mileage, cost, notes, today })
    setErrors(result.errors)
    if (!result.value) return
    setSaving(true)
    const payload = {
      task,
      vehicle,
      completedDate: result.value.completedDate,
      mileage: result.value.mileage,
      costCents: result.value.costCents,
      notes: result.value.notes,
      today,
    }
    const saved = logId ? await updateLog({ ...payload, logId }) : await createLog(payload)
    if (!saved.ok) {
      setFormError(saved.message)
      setSchedulePending(saved.message === COPY.scheduleNeedsUpdate)
      setSaving(false)
      return
    }
    window.location.assign(logId ? `/vehicles/history?id=${vehicle.id}` : `/tasks/detail?id=${task.id}`)
  }

  async function onRetrySchedule() {
    if (saving || !task || !vehicle) return
    setSaving(true)
    const result = await recalculateTask(task, vehicle, localToday())
    if (!result.ok) {
      setFormError(result.message)
      setSaving(false)
      return
    }
    window.location.assign(logId ? `/vehicles/history?id=${vehicle.id}` : `/tasks/detail?id=${task.id}`)
  }

  if (!ready) return null
  if (missing || !task) return <p>{COPY.unavailable} <a href="/vehicles">Back to vehicles</a></p>
  return (
    <form class="stack" onSubmit={onSubmit}>
      <h1>{logId ? `Edit ${task.name}` : `Log ${task.name}`}</h1>
      <Field id="completed-date" label="Completed date" type="date" value={completedDate} error={errors.completedDate} onInput={setCompletedDate} />
      <Field id="mileage" label="Mileage" value={mileage} error={errors.mileage} onInput={setMileage} />
      <Field id="cost" label="Cost (optional)" value={cost} error={errors.cost} onInput={setCost} />
      <Field id="notes" label="Notes (optional)" value={notes} multiline onInput={setNotes} />
      {formError ? <p class="error" role="alert">{formError}</p> : null}
      {schedulePending ? <button type="button" disabled={saving} onClick={() => void onRetrySchedule()}>Try again</button> : null}
      <button type="submit" disabled={saving || schedulePending}>{saving ? 'Saving…' : 'Save maintenance record'}</button>
    </form>
  )
}
