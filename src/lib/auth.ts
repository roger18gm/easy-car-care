import type { Session } from '@supabase/supabase-js'
import { COPY } from './copy'
import { getSupabase } from './supabase'

export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('://')) return '/dashboard'
  return value
}

export function mapSignUpError(message: string): { field: 'email' | 'password' | 'form'; text: string } {
  const lower = message.toLowerCase()
  if (lower.includes('already') || lower.includes('registered')) return { field: 'email', text: COPY.duplicateEmail }
  if (lower.includes('password')) return { field: 'password', text: message }
  return { field: 'form', text: COPY.genericError }
}

export async function getSession(): Promise<Session | null> {
  const { data } = await getSupabase().auth.getSession()
  return data.session
}

export async function currentUserId(): Promise<string | null> {
  const { data } = await getSupabase().auth.getUser()
  return data.user?.id ?? null
}

export async function signUp(name: string, email: string, password: string): Promise<{
  session: Session | null
  error: { message: string } | null
}> {
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  return { session: data.session, error: error ? { message: error.message } : null }
}

export async function signIn(email: string, password: string): Promise<{
  session: Session | null
  error: { message: string } | null
}> {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password })
  return { session: data.session, error: error ? { message: error.message } : null }
}

export async function signOut(): Promise<{ error: { message: string } | null }> {
  const { error } = await getSupabase().auth.signOut()
  return { error: error ? { message: error.message } : null }
}
