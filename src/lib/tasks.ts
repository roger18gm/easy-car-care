import { COPY } from './copy'
import { taskStatus } from './schedule'
import { getSupabase } from './supabase'
import type { Result, TaskRecord } from './types'

export async function getTask(id: string): Promise<Result<TaskRecord>> {
  const { data, error } = await getSupabase().from('maintenance_tasks').select('*').eq('id', id).maybeSingle()
  if (error) return { ok: false, message: COPY.genericError }
  if (!data) return { ok: false, message: COPY.unavailable }
  return { ok: true, data: data as TaskRecord }
}

export async function refreshStatuses(
  vehicleId: string,
  currentMileage: number,
  today: string,
  failureMessage = COPY.genericError,
): Promise<Result<TaskRecord[]>> {
  const client = getSupabase()
  const { data, error } = await client.from('maintenance_tasks').select('*').eq('vehicle_id', vehicleId)
  if (error || !data) return { ok: false, message: COPY.genericError }
  const tasks = data as TaskRecord[]
  for (const task of tasks) {
    const status = taskStatus({
      currentMileage,
      today,
      nextDueMileage: task.next_due_mileage,
      nextDueDate: task.next_due_date,
    })
    if (status === task.status) continue
    task.status = status
    const { error: updateError } = await client.from('maintenance_tasks').update({
      status,
      updated_at: new Date().toISOString(),
    }).eq('id', task.id)
    if (updateError) return { ok: false, message: failureMessage }
  }
  return { ok: true, data: tasks }
}

export async function listTasks(vehicleId: string, currentMileage: number, today: string): Promise<Result<TaskRecord[]>> {
  return refreshStatuses(vehicleId, currentMileage, today)
}
