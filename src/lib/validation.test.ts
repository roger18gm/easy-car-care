import { describe, expect, it } from 'vitest'
import { COPY } from './copy'
import { normalizeVin, parseCostToCents, validateLogForm, validateSignUp, validateVehicleForm } from './validation'

describe('validateSignUp', () => {
  it('rejects a 7 character password', () => {
    const result = validateSignUp({ name: 'Ada', email: 'ada@example.com', password: 'abcdefg' })
    expect(result.value).toBeNull()
    expect(result.errors.password).toBe(COPY.shortPassword)
  })

  it('accepts an 8 character password', () => {
    const result = validateSignUp({ name: ' Ada ', email: 'ada@example.com', password: 'abcdefgh' })
    expect(result.errors).toEqual({})
    expect(result.value).toEqual({ name: 'Ada', email: 'ada@example.com', password: 'abcdefgh' })
  })
})

describe('normalizeVin', () => {
  it('returns null for a blank VIN', () => {
    expect(normalizeVin('   ')).toBeNull()
  })

  it('uppercases a valid VIN', () => {
    expect(normalizeVin('1hgcm82633a004352')).toBe('1HGCM82633A004352')
  })
})

describe('validateVehicleForm', () => {
  it('rejects a VIN that fails the pattern', () => {
    const result = validateVehicleForm({
      year: '2018',
      make: 'Honda',
      model: 'Civic',
      mileage: '54200',
      vin: 'I2345678901234567',
      purchaseDate: '',
      currentMileage: null,
    })
    expect(result.value).toBeNull()
    expect(result.errors.vin).toBe(COPY.badVin)
  })

  it('rejects mileage lower than the current reading', () => {
    const result = validateVehicleForm({
      year: '2018',
      make: 'Honda',
      model: 'Civic',
      mileage: '99',
      vin: '',
      purchaseDate: '',
      currentMileage: 100,
    })
    expect(result.errors.mileage).toBe(COPY.mileageDecrease)
  })

  it('accepts a blank VIN and an equal mileage', () => {
    const result = validateVehicleForm({
      year: '2018',
      make: ' Honda ',
      model: ' Civic ',
      mileage: '100',
      vin: '  ',
      purchaseDate: '',
      currentMileage: 100,
    })
    expect(result.value).toEqual({
      year: 2018,
      make: 'Honda',
      model: 'Civic',
      mileage: 100,
      vin: null,
      purchaseDate: null,
    })
  })
})

describe('validateLogForm', () => {
  it('rejects a future completion date', () => {
    const result = validateLogForm({
      completedDate: '2026-10-23',
      mileage: '100',
      cost: '',
      notes: '',
      today: '2026-10-22',
    })
    expect(result.errors.completedDate).toBe(COPY.futureDate)
  })

  it('converts 54.99 dollars to 5499 cents', () => {
    const result = validateLogForm({
      completedDate: '2026-10-22',
      mileage: '54200',
      cost: '54.99',
      notes: '  ',
      today: '2026-10-22',
    })
    expect(result.value).toEqual({
      completedDate: '2026-10-22',
      mileage: 54200,
      costCents: 5499,
      notes: null,
    })
  })

  it('accepts a blank cost', () => {
    expect(parseCostToCents('  ')).toEqual({ cents: null, error: null })
  })

  it('rejects three decimal places', () => {
    expect(parseCostToCents('54.999').error).toBe(COPY.badCost)
  })
})
