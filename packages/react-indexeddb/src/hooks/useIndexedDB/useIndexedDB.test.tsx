import { vi, Mock, describe, test, expect, beforeEach } from 'vitest'
import { KEYS, NewTodo, Todo, renderHook, waitFor } from '@/testing'
import { seed, create } from '@/testing/mockIndexedDB'
import { invalidationManager } from '@/singletons'
import { useIndexedDB } from '.'
import('fake-indexeddb')

describe('useIndexedDB', () => {
  test('throws an error if used outside of an IndexedDBProvider', () => {
    // Mock console.error to prevent the thrown error from being printed because we expect the error
    vi.spyOn(console, 'error')
    ;(console.error as Mock).mockImplementation(() => {})

    expect(() =>
      renderHook(
        () =>
          useIndexedDB({
            name: 'todos',
            key: [KEYS.TODOS],
            fn: ({ getAll }) => getAll(),
          }),
        {
          renderHook: {
            wrapper: ({ children }) => children,
          },
        },
      ),
    ).toThrowError('useIndexedDB must be used within an IndexedDBProvider')
    ;(console.error as Mock).mockRestore()
  })

  test('does not call fn when the hook is disabled', async () => {
    const fn = vi.fn()

    renderHook(() =>
      useIndexedDB({
        name: 'todos',
        key: [KEYS.TODOS],
        fn,
        enabled: false,
      }),
    )

    expect(fn).not.toHaveBeenCalled()
  })

  test('does call fn when the hook is enabled after mounting it disabled', async () => {
    const fn = vi.fn(() => Promise.resolve())

    const { rerender } = renderHook(
      ({ enabled }) =>
        useIndexedDB({
          name: 'todos',
          key: [KEYS.TODOS],
          fn,
          enabled,
        }),
      {
        renderHook: {
          initialProps: { enabled: false },
        },
      },
    )

    expect(fn).not.toHaveBeenCalled()

    rerender({ enabled: true })

    await waitFor(() => expect(fn).toHaveBeenCalledOnce())
  })

  describe('get()', async () => {
    const TODO: NewTodo = { text: 'Kill myself' }
    let todo: Todo | undefined

    beforeEach(async () => {
      // Cleanup
      window.indexedDB = new IDBFactory()
      todo = undefined
      invalidationManager.reset()

      // Setup
      await seed()
    })

    test('returns undefined if the object with the given ID does not exist', async () => {
      const { result } = renderHook(() =>
        useIndexedDB({
          name: 'todos',
          key: [KEYS.TODOS, 1],
          fn: ({ get }) => get(1),
        }),
      )

      expect(result.current.data).toBeUndefined()

      await waitFor(() => expect(result.current.data).toBeUndefined())
    })

    test('returns the object', async () => {
      todo = await create<NewTodo, Todo>({
        name: 'todos',
        value: TODO,
      })

      const { result } = renderHook(() =>
        useIndexedDB({
          name: 'todos',
          key: [KEYS.TODOS, 1],
          fn: ({ get }) => get(1),
        }),
      )

      expect(result.current.data).toBeUndefined()

      await waitFor(() => expect(result.current.data).toEqual(todo))
    })

    test('retrieves the object and updates data when the key is invalidated', async () => {
      const key = [KEYS.TODOS, 1]

      const { result } = renderHook(() =>
        useIndexedDB({
          name: 'todos',
          key,
          fn: ({ get }) => get(1),
        }),
      )

      expect(result.current.data).toBeUndefined()

      todo = await create<NewTodo, Todo>({
        name: 'todos',
        value: TODO,
      })

      invalidationManager.invalidate(key)

      await waitFor(() => expect(result.current.data).toEqual(todo))
    })

    test('does not retrieve the object and updates data when the key is not invalidated', async () => {
      const { result } = renderHook(() =>
        useIndexedDB({
          name: 'todos',
          key: [KEYS.TODOS, 1],
          fn: ({ get }) => get(1),
        }),
      )

      await waitFor(() => expect(result.current.data).toBeUndefined())

      todo = await create<NewTodo, Todo>({
        name: 'todos',
        value: TODO,
      })

      invalidationManager.invalidate([KEYS.TODOS, 2])

      await waitFor(() => expect(result.current.data).toBeUndefined())
    })

    test('returns an error when the objectStore does not exist', async () => {
      const { result } = renderHook(() =>
        useIndexedDB({
          name: 'does-not-exist',
          key: [KEYS.TODOS, 1],
          fn: ({ get }) => get(1),
        }),
      )

      await waitFor(() => {
        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toEqual(
          new Error('No objectStore named does-not-exist in this database'),
        )
      })
    })
  })

  describe('getAll()', () => {
    const TODOS: NewTodo[] = [
      { text: 'Kill myself' },
      { text: 'Hurt myself' },
      { text: 'Throw myself of a cliff' },
      { text: 'Not be a waste of space' },
    ]
    let todos: Todo[] | undefined

    beforeEach(async () => {
      // Cleanup
      window.indexedDB = new IDBFactory()
      todos = undefined
      invalidationManager.reset()

      // Setup
      await seed()
    })

    test('returns an empty array if there are no objects', async () => {
      const { result } = renderHook(() =>
        useIndexedDB({
          name: 'todos',
          key: [KEYS.TODOS],
          fn: ({ getAll }) => getAll(),
        }),
      )

      expect(result.current.data).toBeUndefined()

      await waitFor(() => expect(result.current.data).toEqual([]))
    })

    test('returns all objects', async () => {
      todos = await Promise.all(
        TODOS.map(async (t) => {
          return await create<NewTodo, Todo>({
            name: 'todos',
            value: t,
          })
        }),
      )

      const { result } = renderHook(() =>
        useIndexedDB({
          name: 'todos',
          key: [KEYS.TODOS],
          fn: ({ getAll }) => getAll(),
        }),
      )

      expect(result.current.data).toBeUndefined()

      await waitFor(() => expect(result.current.data).deep.equal(todos))
    })

    test('retrieves all objects and updates data when the key is invalidated', async () => {
      const key = [KEYS.TODOS]

      const { result } = renderHook(() =>
        useIndexedDB({
          name: 'todos',
          key,
          fn: ({ getAll }) => getAll(),
        }),
      )

      await waitFor(() => expect(result.current.data).toBeUndefined())

      todos = await Promise.all(
        TODOS.map(async (t) => {
          return await create<NewTodo, Todo>({
            name: 'todos',
            value: t,
          })
        }),
      )

      invalidationManager.invalidate(key)

      await waitFor(() => expect(result.current.data).deep.equal(todos))
    })

    test('does not retrieve all objects and updates data when the key is not invalidated', async () => {
      const { result } = renderHook(() =>
        useIndexedDB({
          name: 'todos',
          key: [KEYS.TODOS],
          fn: ({ getAll }) => getAll(),
        }),
      )

      await waitFor(() => expect(result.current.data).toEqual([]))

      todos = await Promise.all(
        TODOS.map(async (t) => {
          return await create<NewTodo, Todo>({
            name: 'todos',
            value: t,
          })
        }),
      )

      invalidationManager.invalidate(['help'])

      await waitFor(() => expect(result.current.data).toEqual([]))
    })

    test('returns an error when the object does not exist', async () => {
      const { result } = renderHook(() =>
        useIndexedDB({
          name: 'does-not-exist',
          key: [KEYS.TODOS],
          fn: ({ getAll }) => getAll(),
        }),
      )

      await waitFor(() => {
        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toEqual(
          new Error('No objectStore named does-not-exist in this database'),
        )
      })
    })
  })
})
