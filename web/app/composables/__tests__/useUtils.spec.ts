import { describe, it, expect, beforeEach } from 'vitest'
import { getBooleanFromLocalStorage } from '~/composables/useUtils'

describe('getBooleanFromLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns the default when an item does not exist', () => {
    expect(getBooleanFromLocalStorage('test', true)).toBe(true)
    expect(getBooleanFromLocalStorage('test', false)).toBe(false)
  })

  it('returns the stored value when the item is set', () => {
    const key = 'test-key'

    localStorage.setItem(key, JSON.stringify(true))
    expect(getBooleanFromLocalStorage(key, false)).toBe(true)

    localStorage.setItem(key, JSON.stringify(false))
    expect(getBooleanFromLocalStorage(key, true)).toBe(false)
  })

  it('returns the default when the item is not a boolean', () => {
    const key = 'test-key'

    localStorage.setItem(key, JSON.stringify('test-value'))
    expect(getBooleanFromLocalStorage(key, false)).toBe(false)

    localStorage.setItem(key, JSON.stringify(123))
    expect(getBooleanFromLocalStorage(key, true)).toBe(true)
  })
})
