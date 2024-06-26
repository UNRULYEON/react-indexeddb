import { useContext, useCallback } from 'react'
import { IndexedDBContext } from '@/contexts/IndexedDBProvider'
import { Add, Put, Remove, Clear } from '@/types'
import { invalidationManager } from '@/singletons'

type UseMutateIndexedDBParameters = {
  name: string
}

export const useMutateIndexedDB = <I, O>({
  name,
}: UseMutateIndexedDBParameters) => {
  const context = useContext(IndexedDBContext)

  if (!context)
    throw new Error(
      'useMutateIndexedDB must be used within an IndexedDBProvider',
    )

  const add = useCallback<Add<I, O>>(
    (value, key) =>
      new Promise<O>((resolve, reject) => {
        if (!context.db) return reject()

        const transaction = context.db.transaction(name, 'readwrite')
        const store = transaction.objectStore(name)

        const request = store.add(value, key)

        request.onsuccess = (event) => {
          resolve({
            // @ts-expect-error - TS doesn't know about the correct type
            id: event.target.result,
            ...value,
          } as unknown as O)
        }

        request.onerror = (event) => {
          reject(event)
        }
      }),
    [context.db, name],
  )

  const put = useCallback<Put<I, O>>(
    (value, key) =>
      new Promise<O>((resolve, reject) => {
        if (!context.db) return reject()

        const transaction = context.db.transaction(name, 'readwrite')
        const store = transaction.objectStore(name)

        const request = store.put(value, key)

        request.onsuccess = (event) => {
          resolve({
            // @ts-expect-error - TS doesn't know about the correct type
            id: event.target.result,
            ...value,
          } as unknown as O)
        }

        request.onerror = (event) => {
          reject(event)
        }
      }),
    [context.db, name],
  )

  const remove = useCallback<Remove>(
    (key) =>
      new Promise<void>((resolve, reject) => {
        if (!context.db) return reject()

        const transaction = context.db.transaction(name, 'readwrite')
        const store = transaction.objectStore(name)

        const request = store.delete(key)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = (event) => {
          reject(event)
        }
      }),
    [context.db, name],
  )

  const clear = useCallback<Clear>(
    () =>
      new Promise<void>((resolve, reject) => {
        if (!context.db) return reject()

        const transaction = context.db.transaction(name, 'readwrite')
        const store = transaction.objectStore(name)

        const request = store.clear()

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = (event) => {
          reject(event)
        }
      }),
    [context.db, name],
  )

  return {
    add,
    put,
    remove,
    clear,
    invalidate: invalidationManager.invalidate,
  }
}
