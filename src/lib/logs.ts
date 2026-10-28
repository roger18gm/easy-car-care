import { COPY } from './copy'
import { recalculatedTaskFields, utcCalendarDate } from './schedule'
import { getSupabase } from './supabase'
import type { LogListItem, LogRecord, Result, TaskRecord, VehicleRecord } from './types'

export function taskNameFromEmbed(value: { name: string } | { name: string }[] | null): string {
  if (!value) return 'Service'
  if (Array.isArray(value)) return value[0]?.name ?? 'Service'
  return value.name
}

const LOG_COLUMNS = 'id, vehicle_id, maintenance_task_id, completed_date, completed_mileage, cost_cents, notes, created_at, updated_at, maintenance_tasks(name)'

export async function listVehicleLogs(vehicleId: string, limit?: number): Promise<Result<LogListItem[]>> {
  const base = getSupabase().from('maintenance_logs').select(LOG_COLUMNS).eq('vehicle_id', vehicleId).order('completed_date', { ascending: false }).order('created_at', { ascending: false })
  const { data, error } = await (limit == null ? base : base.limit(limit))
  if (error || !data) return { ok: false, message: COPY.genericError }
  const logs = data.map((row) => {
    const record = row as LogRecord & { maintenance_tasks: { name: string } | { name: string }[] | null }
    return { ...record, task_name: taskNameFromEmbed(record.maintenance_tasks) }
  })
  return { ok: true, data: logs }
}

export async function getLog(id: string): Promise<Result<LogRecord>> {
  const { data, error } = await getSupabase().from('maintenance_logs').select('*').eq('id', id).maybeSingle()
  if (error) return { ok: false, message: COPY.genericError }
  if (!data) return { ok: false, message: COPY.unavailable }
  return { ok: true, data: data as LogRecord }
}

async function logsForTask(taskId: string): Promise<Result<LogRecord[]>> {
  const { data, error } = await getSupabase().from('maintenance_logs').select('*').eq('maintenance_task_id', taskId)
  if (error || !data) return { ok: false, message: COPY.scheduleNeedsUpdate }
  return { ok: true, data: data as LogRecord[] }
}

export async function recalculateTask(task: TaskRecord, vehicle: VehicleRecord, today: string): Promise<Result<null>> {
  const logs = await logsForTask(task.id)
  if (!logs.ok) return logs
  const fields = recalculatedTaskFields({
    intervalMiles: task.interval_miles,
    intervalMonths: task.interval_months,
    currentMileage: vehicle.current_mileage,
    createdOn: utcCalendarDate(vehicle.created_at),
    today,
    logs: logs.data.map((log) => ({
      completedDate: log.completed_date,
      completedMileage: log.completed_mileage,
      createdAt: log.created_at,
    })),
  })
  const { error } = await getSupabase().from('maintenance_tasks').update({
    next_due_mileage: fields.nextDueMileage,
    next_due_date: fields.nextDueDate,
    status: fields.status,
    updated_at: new Date().toISOString(),
  }).eq('id', task.id)
  if (error) return { ok: false, message: COPY.scheduleNeedsUpdate }
  return { ok: true, data: null }
}

export async function createLog(input: {
  task: TaskRecord
  vehicle: VehicleRecord
  completedDate: string
  mileage: number
  costCents: number | null
  notes: string | null
  today: string
}): Promise<Result<LogRecord>> {
  const { data, error } = await getSupabase().from('maintenance_logs').insert({
    vehicle_id: input.vehicle.id,
    maintenance_task_id: input.task.id,
    completed_date: input.completedDate,
    completed_mileage: input.mileage,
    cost_cents: input.costCents,
    notes: input.notes,
  }).select('*').single()
  if (error || !data) return { ok: false, message: COPY.genericError }
  const saved = await recalculateTask(input.task, input.vehicle, input.today)
  if (!saved.ok) return { ok: false, message: saved.message }
  return { ok: true, data: data as LogRecord }
}

export async function updateLog(input: {
  logId: string
  task: TaskRecord
  vehicle: VehicleRecord
  completedDate: string
  mileage: number
  costCents: number | null
  notes: string | null
  today: string
}): Promise<Result<LogRecord>> {
  const { data, error } = await getSupabase().from('maintenance_logs').update({
    completed_date: input.completedDate,
    completed_mileage: input.mileage,
    cost_cents: input.costCents,
    notes: input.notes,
    updated_at: new Date().toISOString(),
  }).eq('id', input.logId).select('*').single()
  if (error || !data) return { ok: false, message: COPY.genericError }
  const saved = await recalculateTask(input.task, input.vehicle, input.today)
  if (!saved.ok) return { ok: false, message: saved.message }
  return { ok: true, data: data as LogRecord }
}

export async function deleteLog(logId: string, task: TaskRecord, vehicle: VehicleRecord, today: string): Promise<Result<null>> {
  const { error } = await getSupabase().from('maintenance_logs').delete().eq('id', logId)
  if (error) return { ok: false, message: COPY.genericError }
  const saved = await recalculateTask(task, vehicle, today)
  if (!saved.ok) return { ok: false, message: saved.message }
  return { ok: true, data: null }
}
