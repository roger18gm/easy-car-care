import { signOut } from '../lib/auth'

export function SignOutButton() {
  async function onClick() {
    localStorage.removeItem('easycarcare.activeVehicleId')
    await signOut()
    window.location.assign('/')
  }

  return <button type="button" onClick={onClick}>Sign out</button>
}
