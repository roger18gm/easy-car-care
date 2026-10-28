import type { TaskStatus } from './schedule'

export interface VehicleRecord {
  id: string
  user_id: string
  vin: string | null
  year: number
  make: string
  model: string
  trim: string | null
  current_mileage: number
  purchase_date: string | null
  created_at: string
  updated_at: string
}

export interface TemplateRecord {
  id: string
  name: string
  description: string
  default_interval_miles: number | null
  default_interval_months: number | null
}

export interface TaskRecord {
  id: string
  vehicle_id: string
  service_template_id: string | null
  name: string
  description: string
  interval_miles: number | null
  interval_months: number | null
  next_due_mileage: number | null
  next_due_date: string | null
  status: TaskStatus
  is_custom: boolean
  created_at: string
  updated_at: string
}

export interface LogRecord {
  id: string
  vehicle_id: string
  maintenance_task_id: string
  completed_date: string
  completed_mileage: number
  cost_cents: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LogListItem extends LogRecord {
  task_name: string
}

export type Result<T> = { ok: true; data: T } | { ok: false; message: string; vehicleId?: string }
