import { describe, expect, it } from 'vitest'
import { COPY } from './copy'
import { buildStarterTaskRows, messageForVehicleError, resolveActiveVehicleId, templatesMissingFromTasks } from './vehicles'

const oil = {
  id: 'template-1',
  name: 'Oil change',
  description: 'Fresh oil keeps the engine running smoothly.',
  default_interval_miles: 5000,
  default_interval_months: 6,
}

describe('resolveActiveVehicleId', () => {
  it('returns null when the user has no vehicles', () => {
    expect(resolveActiveVehicleId('stored', [])).toBeNull()
  })

  it('keeps a stored id that is still in the list', () => {
    expect(resolveActiveVehicleId('b', [{ id: 'a' }, { id: 'b' }])).toBe('b')
  })

  it('falls back to the newest vehicle', () => {
    expect(resolveActiveVehicleId('missing', [{ id: 'newest' }, { id: 'older' }])).toBe('newest')
  })
})

describe('buildStarterTaskRows', () => {
  it('copies the template and sets the initial due point', () => {
    expect(buildStarterTaskRows({
      vehicleId: 'vehicle-1',
      currentMileage: 54200,
      today: '2026-10-22',
      templates: [oil],
    })).toEqual([
      {
        vehicle_id: 'vehicle-1',
        service_template_id: 'template-1',
        name: 'Oil change',
        description: 'Fresh oil keeps the engine running smoothly.',
        interval_miles: 5000,
        interval_months: 6,
        next_due_mileage: 59200,
        next_due_date: '2027-04-22',
        status: 'upcoming',
        is_custom: false,
      },
    ])
  })
})

describe('templatesMissingFromTasks', () => {
  it('returns templates whose names are absent', () => {
    expect(templatesMissingFromTasks([oil], ['Tire rotation']).map((template) => template.name)).toEqual(['Oil change'])
  })

  it('returns nothing when every template name exists', () => {
    expect(templatesMissingFromTasks([oil], ['Oil change'])).toEqual([])
  })
})

describe('messageForVehicleError', () => {
  it('maps a duplicate VIN constraint', () => {
    expect(messageForVehicleError({ code: '23505', message: 'vehicles_vin_unique' })).toBe(COPY.duplicateVin)
  })

  it('uses the generic message for other failures', () => {
    expect(messageForVehicleError({ message: 'timeout' })).toBe(COPY.genericError)
  })
})
