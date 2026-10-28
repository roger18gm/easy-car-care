import { currentUserId } from './auth'
import { COPY } from './copy'
import { dueTargets, taskStatus, type TaskStatus } from './schedule'
import { getSupabase } from './supabase'
import { refreshStatuses } from './tasks'
import type { Result, TemplateRecord, VehicleRecord } from './types'

const ACTIVE_VEHICLE_KEY = 'easycarcare.activeVehicleId'

export function resolveActiveVehicleId(storedId: string | null, vehiclesNewestFirst: { id: string }[]): string | null {
  if (vehiclesNewestFirst.length === 0) return null
  if (storedId && vehiclesNewestFirst.some((vehicle) => vehicle.id === storedId)) return storedId
  return vehiclesNewestFirst[0].id
}

export function buildStarterTaskRows(args: {
  vehicleId: string
  currentMileage: number
  today: string
  templates: TemplateRecord[]
}): Array<{
  vehicle_id: string
  service_template_id: string
  name: string
  description: string
  interval_miles: number | null
  interval_months: number | null
  next_due_mileage: number | null
  next_due_date: string | null
  status: TaskStatus
  is_custom: false
}> {
  return args.templates.map((template) => {
    const targets = dueTargets(args.currentMileage, args.today, template.default_interval_miles, template.default_interval_months)
    return {
      vehicle_id: args.vehicleId,
      service_template_id: template.id,
      name: template.name,
      description: template.description,
      interval_miles: template.default_interval_miles,
      interval_months: template.default_interval_months,
      next_due_mileage: targets.nextDueMileage,
      next_due_date: targets.nextDueDate,
      status: taskStatus({
        currentMileage: args.currentMileage,
        today: args.today,
        nextDueMileage: targets.nextDueMileage,
        nextDueDate: targets.nextDueDate,
      }),
      is_custom: false,
    }
  })
}

export function templatesMissingFromTasks(templates: TemplateRecord[], existingNames: string[]): TemplateRecord[] {
  const names = new Set(existingNames)
  return templates.filter((template) => !names.has(template.name))
}

export function messageForVehicleError(error: { code?: string; message?: string } | null): string {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`
  if (text.includes('23505') || text.includes('vehicles_vin_unique')) return COPY.duplicateVin
  return COPY.genericError
}

export function readStoredVehicleId(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(ACTIVE_VEHICLE_KEY)
}

export function storeVehicleId(id: string): void {
  localStorage.setItem(ACTIVE_VEHICLE_KEY, id)
}

export function clearStoredVehicleId(): void {
  localStorage.removeItem(ACTIVE_VEHICLE_KEY)
}

export async function listVehicles(): Promise<Result<VehicleRecord[]>> {
  const { data, error } = await getSupabase().from('vehicles').select('*').order('created_at', { ascending: false })
  if (error || !data) return { ok: false, message: COPY.genericError }
  return { ok: true, data: data as VehicleRecord[] }
}

export async function getVehicle(id: string): Promise<Result<VehicleRecord>> {
  const { data, error } = await getSupabase().from('vehicles').select('*').eq('id', id).maybeSingle()
  if (error) return { ok: false, message: COPY.genericError }
  if (!data) return { ok: false, message: COPY.unavailable }
  return { ok: true, data: data as VehicleRecord }
}

async function insertMissingTasks(vehicle: VehicleRecord, today: string): Promise<Result<null>> {
  const client = getSupabase()
  const templates = await client.from('service_templates').select('id, name, description, default_interval_miles, default_interval_months').eq('active', true)
  if (templates.error || !templates.data) return { ok: false, message: COPY.planMissing }
  const existing = await client.from('maintenance_tasks').select('name').eq('vehicle_id', vehicle.id)
  if (existing.error || !existing.data) return { ok: false, message: COPY.planMissing }
  const missing = templatesMissingFromTasks(templates.data as TemplateRecord[], existing.data.map((row) => String(row.name)))
  if (missing.length === 0) return { ok: true, data: null }
  const inserted = await client.from('maintenance_tasks').insert(buildStarterTaskRows({
    vehicleId: vehicle.id,
    currentMileage: vehicle.current_mileage,
    today,
    templates: missing,
  }))
  if (inserted.error) return { ok: false, message: COPY.planMissing }
  return { ok: true, data: null }
}

export async function retryStarterPlan(vehicle: VehicleRecord, today: string): Promise<Result<null>> {
  return insertMissingTasks(vehicle, today)
}

export async function createVehicle(
  input: { year: number; make: string; model: string; mileage: number; vin: string | null; purchaseDate: string | null },
  today: string,
): Promise<Result<VehicleRecord>> {
  const userId = await currentUserId()
  if (!userId) return { ok: false, message: COPY.genericError }
  const { data, error } = await getSupabase().from('vehicles').insert({
    user_id: userId,
    year: input.year,
    make: input.make,
    model: input.model,
    current_mileage: input.mileage,
    vin: input.vin,
    purchase_date: input.purchaseDate,
  }).select('*').single()
  if (error || !data) return { ok: false, message: messageForVehicleError(error) }
  const vehicle = data as VehicleRecord
  const planned = await insertMissingTasks(vehicle, today)
  if (!planned.ok) return { ok: false, message: COPY.planMissing, vehicleId: vehicle.id }
  return { ok: true, data: vehicle }
}

export async function updateVehicle(
  id: string,
  input: { year: number; make: string; model: string; mileage: number; vin: string | null; purchaseDate: string | null },
  today: string,
): Promise<Result<VehicleRecord>> {
  const { data, error } = await getSupabase().from('vehicles').update({
    year: input.year,
    make: input.make,
    model: input.model,
    current_mileage: input.mileage,
    vin: input.vin,
    purchase_date: input.purchaseDate,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select('*').single()
  if (error || !data) return { ok: false, message: messageForVehicleError(error) }
  const refreshed = await refreshStatuses(id, input.mileage, today, COPY.scheduleNeedsUpdate)
  if (!refreshed.ok) return { ok: false, message: refreshed.message, vehicleId: id }
  return { ok: true, data: data as VehicleRecord }
}

export async function updateMileage(id: string, mileage: number, today: string): Promise<Result<VehicleRecord>> {
  const { data, error } = await getSupabase().from('vehicles').update({
    current_mileage: mileage,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select('*').single()
  if (error || !data) return { ok: false, message: COPY.genericError }
  const refreshed = await refreshStatuses(id, mileage, today, COPY.scheduleNeedsUpdate)
  if (!refreshed.ok) return { ok: false, message: refreshed.message, vehicleId: id }
  return { ok: true, data: data as VehicleRecord }
}

export async function deleteVehicle(id: string): Promise<Result<null>> {
  const { error } = await getSupabase().from('vehicles').delete().eq('id', id)
  if (error) return { ok: false, message: COPY.genericError }
  return { ok: true, data: null }
}
