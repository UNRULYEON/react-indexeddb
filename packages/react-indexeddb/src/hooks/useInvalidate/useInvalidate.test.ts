import { vi, Mock, describe, test, expect } from 'vitest'
import { renderHook } from '@/testing'
import { useInvalidate } from '.'
import { invalidationManager } from '@/singletons'

describe('useInvalidate', () => {
  test('throws an error if used outside of an IndexedDBProvider', () => {
    // Mock console.error to prevent the thrown error from being printed because we expect the error
    vi.spyOn(console, 'error')
    ;(console.error as Mock).mockImplementation(() => {})

    expect(() =>
      renderHook(() => useInvalidate(), {
        renderHook: {
          wrapper: ({ children }) => children,
        },
      }),
    ).toThrowError('useIndexedDB must be used within an IndexedDBProvider')
    ;(console.error as Mock).mockRestore()
  })

  test('should call the invalidate function when calling invalidate', () => {
    const invalidateSpy = vi.spyOn(invalidationManager, 'invalidate')

    const { result } = renderHook(() => useInvalidate())

    result.current.invalidate(['todos'])

    expect(invalidateSpy).toHaveBeenCalledTimes(1)
  })
})
