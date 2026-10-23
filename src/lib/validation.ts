import { COPY } from './copy'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/
const MILEAGE_PATTERN = /^\d+$/
const COST_PATTERN = /^\d+(\.\d{1,2})?$/

export function normalizeVin(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  return trimmed.toUpperCase()
}

export function parseCostToCents(value: string): { cents: number | null; error: string | null } {
  const trimmed = value.trim()
  if (trimmed === '') return { cents: null, error: null }
  if (!COST_PATTERN.test(trimmed)) return { cents: null, error: COPY.badCost }
  const [dollars, fraction = ''] = trimmed.split('.')
  const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, '0'))
  return { cents, error: null }
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function validateSignUp(input: { name: string; email: string; password: string }): {
  errors: { name?: string; email?: string; password?: string }
  value: { name: string; email: string; password: string } | null
} {
  const errors: { name?: string; email?: string; password?: string } = {}
  const name = input.name.trim()
  const email = input.email.trim()
  if (name === '') errors.name = COPY.enterName
  if (email === '') errors.email = COPY.enterEmail
  else if (!EMAIL_PATTERN.test(email)) errors.email = COPY.badEmail
  if (input.password === '') errors.password = COPY.enterPassword
  else if (input.password.length < 8) errors.password = COPY.shortPassword
  if (errors.name || errors.email || errors.password) return { errors, value: null }
  return { errors, value: { name, email, password: input.password } }
}

export function validateSignIn(input: { email: string; password: string }): {
  errors: { email?: string; password?: string }
  value: { email: string; password: string } | null
} {
  const errors: { email?: string; password?: string } = {}
  const email = input.email.trim()
  if (email === '') errors.email = COPY.enterEmail
  else if (!EMAIL_PATTERN.test(email)) errors.email = COPY.badEmail
  if (input.password === '') errors.password = COPY.enterPassword
  if (errors.email || errors.password) return { errors, value: null }
  return { errors, value: { email, password: input.password } }
}

export function validateVehicleForm(input: {
  year: string
  make: string
  model: string
  mileage: string
  vin: string
  purchaseDate: string
  currentMileage: number | null
}): {
  errors: { year?: string; make?: string; model?: string; mileage?: string; vin?: string; purchaseDate?: string }
  value: { year: number; make: string; model: string; mileage: number; vin: string | null; purchaseDate: string | null } | null
} {
  const errors: { year?: string; make?: string; model?: string; mileage?: string; vin?: string; purchaseDate?: string } = {}
  const yearNumber = Number(input.year)
  if (!/^\d{4}$/.test(input.year.trim()) || yearNumber < 1980 || yearNumber > 2100) errors.year = COPY.enterYear
  const make = input.make.trim()
  const model = input.model.trim()
  if (make === '') errors.make = COPY.enterMake
  if (model === '') errors.model = COPY.enterModel
  let mileage: number | null = null
  if (!MILEAGE_PATTERN.test(input.mileage.trim())) errors.mileage = COPY.enterMileage
  else {
    mileage = Number(input.mileage.trim())
    if (input.currentMileage != null && mileage < input.currentMileage) errors.mileage = COPY.mileageDecrease
  }
  const vin = normalizeVin(input.vin)
  if (vin != null && !VIN_PATTERN.test(vin)) errors.vin = COPY.badVin
  const purchaseDate = input.purchaseDate.trim()
  if (purchaseDate !== '' && !isCalendarDate(purchaseDate)) errors.purchaseDate = COPY.badPurchaseDate
  if (Object.keys(errors).length > 0 || mileage == null) return { errors, value: null }
  return {
    errors,
    value: {
      year: yearNumber,
      make,
      model,
      mileage,
      vin,
      purchaseDate: purchaseDate === '' ? null : purchaseDate,
    },
  }
}

export function validateLogForm(input: {
  completedDate: string
  mileage: string
  cost: string
  notes: string
  today: string
}): {
  errors: { completedDate?: string; mileage?: string; cost?: string }
  value: { completedDate: string; mileage: number; costCents: number | null; notes: string | null } | null
} {
  const errors: { completedDate?: string; mileage?: string; cost?: string } = {}
  const completedDate = input.completedDate.trim()
  if (completedDate === '') errors.completedDate = COPY.enterCompletedDate
  else if (!isCalendarDate(completedDate)) errors.completedDate = COPY.enterCompletedDate
  else if (completedDate > input.today) errors.completedDate = COPY.futureDate
  let mileage: number | null = null
  if (!MILEAGE_PATTERN.test(input.mileage.trim())) errors.mileage = COPY.enterMileage
  else mileage = Number(input.mileage.trim())
  const cost = parseCostToCents(input.cost)
  if (cost.error) errors.cost = cost.error
  const notes = input.notes.trim()
  if (Object.keys(errors).length > 0 || mileage == null) return { errors, value: null }
  return {
    errors,
    value: {
      completedDate,
      mileage,
      costCents: cost.cents,
      notes: notes === '' ? null : notes,
    },
  }
}
