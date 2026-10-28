import { useEffect, useState } from 'preact/hooks'
import { getSession, safeNextPath, signIn } from '../lib/auth'
import { COPY } from '../lib/copy'
import { validateSignIn } from '../lib/validation'
import { Field } from './Field'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSession().then((session) => {
      if (session) window.location.assign('/dashboard')
    })
  }, [])

  async function onSubmit(event: Event) {
    event.preventDefault()
    if (saving) return
    const result = validateSignIn({ email, password })
    setErrors(result.errors)
    if (!result.value) return
    setSaving(true)
    const response = await signIn(result.value.email, result.value.password)
    if (response.error || !response.session) {
      setErrors({ form: COPY.signInFailed })
      setSaving(false)
      return
    }
    const next = new URLSearchParams(window.location.search).get('next')
    window.location.assign(safeNextPath(next))
  }

  return (
    <form class="stack" onSubmit={onSubmit}>
      <Field id="email" label="Email" type="email" value={email} error={errors.email} onInput={setEmail} />
      <Field id="password" label="Password" type="password" value={password} error={errors.password} onInput={setPassword} />
      {errors.form ? <p class="error" role="alert">{errors.form}</p> : null}
      <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Sign in'}</button>
    </form>
  )
}
