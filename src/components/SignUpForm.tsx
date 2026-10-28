import { useEffect, useState } from 'preact/hooks'
import { getSession, mapSignUpError, signUp } from '../lib/auth'
import { COPY } from '../lib/copy'
import { validateSignUp } from '../lib/validation'
import { Field } from './Field'

export function SignUpForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({})
  const [created, setCreated] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSession().then((session) => {
      if (session) window.location.assign('/dashboard')
    })
  }, [])

  async function onSubmit(event: Event) {
    event.preventDefault()
    if (saving) return
    const result = validateSignUp({ name, email, password })
    setErrors(result.errors)
    if (!result.value) return
    setSaving(true)
    const response = await signUp(result.value.name, result.value.email, result.value.password)
    if (response.error) {
      const mapped = mapSignUpError(response.error.message)
      setErrors(mapped.field === 'form' ? { form: mapped.text } : { [mapped.field]: mapped.text })
      setSaving(false)
      return
    }
    if (!response.session) {
      setCreated(true)
      setSaving(false)
      return
    }
    window.location.assign('/dashboard')
  }

  if (created) {
    return (
      <p>
        {COPY.accountCreated} <a href="/sign-in">Sign in</a>
      </p>
    )
  }

  return (
    <form class="stack" onSubmit={onSubmit}>
      <Field id="name" label="Name" value={name} error={errors.name} onInput={setName} />
      <Field id="email" label="Email" type="email" value={email} error={errors.email} onInput={setEmail} />
      <Field id="password" label="Password" type="password" value={password} error={errors.password} onInput={setPassword} />
      {errors.form ? <p class="error" role="alert">{errors.form}</p> : null}
      <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create account'}</button>
    </form>
  )
}
