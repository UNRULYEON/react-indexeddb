import { vi, Mock, describe, test, expect } from 'vitest'
import { NewTodo, Todo, renderHook, waitFor } from '@/testing'
import { create, get } from '@/testing/mockIndexedDB'
import { useMutateIndexedDB } from '.'

describe('useMutateIndexedDB', () => {
  test('throws an error if used outside of an IndexedDBProvider', () => {
    // Mock console.error to prevent the thrown error from being printed because we expect the error
    vi.spyOn(console, 'error')
    ;(console.error as Mock).mockImplementation(() => {})

    expect(() =>
      renderHook(
        () =>
          useMutateIndexedDB({
            name: 'todos',
          }),
        {
          renderHook: {
            wrapper: ({ children }) => children,
          },
        },
      ),
    ).toThrowError(
      'useMutateIndexedDB must be used within an IndexedDBProvider',
    )
    ;(console.error as Mock).mockRestore()
  })

  describe('add()', () => {
    test('adds a new item to the store', async () => {
      const TODO: Todo = {
        id: 1,
        text: 'Kill myself',
      }

      const { result } = renderHook(() =>
        useMutateIndexedDB<NewTodo, Todo>({
          name: 'todos',
        }),
      )

      await waitFor(() =>
        result.current.add({
          text: TODO.text,
        }),
      )

      const createdTodo = await get<Todo>({ name: 'todos', key: TODO.id })

      expect(createdTodo).toEqual(TODO)
    })
  })

  describe('put()', () => {
    test('updates an existing item in the store', async () => {
      const TODO: Todo = {
        id: 1,
        text: 'Kill myself',
      }

      await waitFor(() =>
        create<NewTodo, Todo>({ name: 'todos', value: { text: TODO.text } }),
      )

      const { result } = renderHook(() =>
        useMutateIndexedDB<NewTodo, Todo>({
          name: 'todos',
        }),
      )

      await waitFor(() =>
        result.current.put({
          text: 'test',
        }),
      )

      const updatedTodo = await get<Todo>({ name: 'todos', key: TODO.id })

      expect(updatedTodo).toEqual(TODO)
    })
  })

  describe('remove()', () => {
    test('removes an item from the store', async () => {
      const TODO: Todo = {
        id: 1,
        text: 'Kill myself',
      }

      await waitFor(() =>
        create<NewTodo, Todo>({ name: 'todos', value: { text: TODO.text } }),
      )

      const { result } = renderHook(() =>
        useMutateIndexedDB<NewTodo, Todo>({
          name: 'todos',
        }),
      )

      await waitFor(() => result.current.remove(TODO.id))

      const todo = await get<Todo>({ name: 'todos', key: TODO.id })

      expect(todo).toBeUndefined()
    })
  })

  describe('clear()', () => {
    test('removes all items from the store', async () => {
      const TODOS: NewTodo[] = [
        { text: 'Kill myself' },
        { text: 'Kill myself again' },
      ]

      await waitFor(() =>
        create<NewTodo, Todo>({ name: 'todos', value: TODOS[0] }),
      )
      await waitFor(() =>
        create<NewTodo, Todo>({ name: 'todos', value: TODOS[1] }),
      )

      const { result } = renderHook(() =>
        useMutateIndexedDB<NewTodo, Todo>({
          name: 'todos',
        }),
      )

      await waitFor(() => result.current.clear())

      const todo1 = await get<Todo>({ name: 'todos', key: 1 })
      const todo2 = await get<Todo>({ name: 'todos', key: 2 })

      expect(todo1).toBeUndefined()
      expect(todo2).toBeUndefined()
    })
  })
})
