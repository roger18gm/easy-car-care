import { describe, expect, it } from 'vitest'
import { mapSignUpError, safeNextPath } from './auth'
import { COPY } from './copy'

describe('safeNextPath', () => {
  it('keeps a relative path', () => {
    expect(safeNextPath('/vehicles/abc')).toBe('/vehicles/abc')
  })

  it('ignores an empty value', () => {
    expect(safeNextPath(null)).toBe('/dashboard')
  })

  it('ignores a protocol-relative path', () => {
    expect(safeNextPath('//evil.example')).toBe('/dashboard')
  })

  it('ignores an absolute URL', () => {
    expect(safeNextPath('https://evil.example')).toBe('/dashboard')
  })
})

describe('mapSignUpError', () => {
  it('maps a duplicate account onto the email field', () => {
    expect(mapSignUpError('User already registered')).toEqual({ field: 'email', text: COPY.duplicateEmail })
  })

  it('keeps a server password message on the password field', () => {
    expect(mapSignUpError('Password should be at least 8 characters')).toEqual({
      field: 'password',
      text: 'Password should be at least 8 characters',
    })
  })

  it('uses the generic message for anything else', () => {
    expect(mapSignUpError('network down')).toEqual({ field: 'form', text: COPY.genericError })
  })
})
