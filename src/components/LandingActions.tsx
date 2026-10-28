import { useEffect, useState } from 'preact/hooks'
import { getSession } from '../lib/auth'

export function LandingActions() {
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    getSession().then((session) => setSignedIn(session != null))
  }, [])

  if (signedIn) return <a class="button" href="/dashboard">Go to dashboard</a>
  return (
    <div class="stack">
      <a class="button" href="/sign-up">Create account</a>
      <a href="/sign-in">Sign in</a>
    </div>
  )
}
