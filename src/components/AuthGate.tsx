import { useEffect, useState } from 'preact/hooks'
import { getSession } from '../lib/auth'
import { COPY } from '../lib/copy'

export function AuthGate({ nextPath }: { nextPath: string }) {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    getSession().then((session) => {
      if (!session) {
        window.location.assign(`/sign-in?next=${encodeURIComponent(nextPath)}`)
        return
      }
      setChecking(false)
    })
  }, [nextPath])

  if (!checking) return null
  return <p>{COPY.checking}</p>
}
