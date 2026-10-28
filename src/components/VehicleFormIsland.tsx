import { useEffect, useState } from 'preact/hooks'
import { getSession } from '../lib/auth'
import { COPY } from '../lib/copy'
import { localToday } from '../lib/schedule'
import { createVehicle, getVehicle, storeVehicleId, updateVehicle } from '../lib/vehicles'
import { validateVehicleForm } from '../lib/validation'
import { Field } from './Field'

export function VehicleFormIsland({ mode }: { mode: 'create' | 'edit' }) {
  const [vehicleId, setVehicleId] = useState('')
  const [ready, setReady] = useState(false)
  const [year, setYear] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [mileage, setMileage] = useState('')
  const [vin, setVin] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [currentMileage, setCurrentMileage] = useState<number | null>(null)
  const [errors, setErrors] = useState<{ year?: string; make?: string; model?: string; mileage?: string; vin?: string; purchaseDate?: string }>({})
  const [formError, setFormError] = useState('')
  const [missing, setMissing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id') ?? ''
    setVehicleId(id)
    getSession().then(async (session) => {
      if (!session) return
      if (mode === 'edit' && id) {
        const result = await getVehicle(id)
        if (!result.ok) {
          setMissing(true)
          setReady(true)
          return
        }
        setYear(String(result.data.year))
        setMake(result.data.make)
        setModel(result.data.model)
        setMileage(String(result.data.current_mileage))
        setVin(result.data.vin ?? '')
        setPurchaseDate(result.data.purchase_date ?? '')
        setCurrentMileage(result.data.current_mileage)
      }
      setReady(true)
    })
  }, [mode])

  async function onSubmit(event: Event) {
    event.preventDefault()
    if (saving) return
    const result = validateVehicleForm({ year, make, model, mileage, vin, purchaseDate, currentMileage })
    setErrors(result.errors)
    if (!result.value) return
    setSaving(true)
    const today = localToday()
    const saved = mode === 'create'
      ? await createVehicle(result.value, today)
      : await updateVehicle(vehicleId ?? '', result.value, today)
    const id = saved.ok ? saved.data.id : saved.vehicleId
    if (id) {
      storeVehicleId(id)
      window.location.assign(`/vehicles/detail?id=${id}`)
      return
    }
    setFormError(saved.ok ? '' : saved.message)
    setSaving(false)
  }

  if (!ready) return null
  if (missing) return <p>{COPY.unavailable} <a href="/vehicles">Back to vehicles</a></p>
  return (
    <form class="stack" onSubmit={onSubmit}>
      <Field id="year" label="Year" value={year} error={errors.year} onInput={setYear} />
      <Field id="make" label="Make" value={make} error={errors.make} onInput={setMake} />
      <Field id="model" label="Model" value={model} error={errors.model} onInput={setModel} />
      <Field id="mileage" label="Current mileage" value={mileage} error={errors.mileage} onInput={setMileage} />
      <Field id="vin" label="VIN (optional)" value={vin} error={errors.vin} onInput={setVin} />
      <Field id="purchase-date" label="Purchase date (optional)" type="date" value={purchaseDate} error={errors.purchaseDate} onInput={setPurchaseDate} />
      {formError ? <p class="error" role="alert">{formError}</p> : null}
      <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save vehicle'}</button>
    </form>
  )
}
