import { describe, expect, it } from 'vitest'
import { taskNameFromEmbed } from './logs'

describe('taskNameFromEmbed', () => {
  it('reads a single embedded task', () => {
    expect(taskNameFromEmbed({ name: 'Oil change' })).toBe('Oil change')
  })

  it('reads the first task from an array', () => {
    expect(taskNameFromEmbed([{ name: 'Tire rotation' }])).toBe('Tire rotation')
  })

  it('uses a fallback when the task is missing', () => {
    expect(taskNameFromEmbed(null)).toBe('Service')
  })
})
