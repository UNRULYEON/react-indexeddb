/* v8 ignore start */

import { IndexedDBConfig } from '@/types'

import('fake-indexeddb')

export const defaultConfig: IndexedDBConfig = {
  name: 'todo-app',
  version: 1,
  objectStores: [
    {
      name: 'todos',
      options: { keyPath: 'id', autoIncrement: true },
      indices: [{ name: 'text', options: { unique: false } }],
    },
  ],
}

const seed = () =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(defaultConfig.name, defaultConfig.version)

    request.onupgradeneeded = (event) => {
      // @ts-expect-error - TS doesn't know about the correct type
      const db = event.target.result as IDBDatabase

      defaultConfig.objectStores.forEach((objectStore) => {
        const store = db.createObjectStore(
          objectStore.name,
          objectStore.options,
        )

        objectStore.indices?.forEach((index) => {
          store.createIndex(
            index.name,
            index.keyPath ?? index.name,
            index.options,
          )
        })
      })
    }

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = (event) => {
      reject(event)
    }
  })

const get = <T>({ name, key }: { name: string; key: IDBValidKey }) =>
  new Promise<T>((resolve, reject) => {
    const request = indexedDB.open(defaultConfig.name, defaultConfig.version)

    request.onsuccess = (event) => {
      // @ts-expect-error - TS doesn't know about the correct type
      const db = event.target.result as IDBDatabase

      if (!db) return reject()

      const transaction = db.transaction(name, 'readonly') as IDBTransaction

      transaction.onerror = (event) => {
        reject(event)
      }

      const store = transaction.objectStore(name)

      const request = store.get(key)

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest<T>).result)
      }

      request.onerror = (event) => {
        reject(event)
      }
    }
  })

const create = <I, O>({ name, value }: { name: string; value: I }) =>
  new Promise<O>((resolve, reject) => {
    const request = indexedDB.open(defaultConfig.name, defaultConfig.version)

    request.onsuccess = (event) => {
      // @ts-expect-error - TS doesn't know about the correct type
      const db = event.target.result as IDBDatabase

      if (!db) return reject()

      const transaction = db.transaction(name, 'readwrite') as IDBTransaction

      transaction.onerror = (event) => {
        reject(event)
      }

      const store = transaction.objectStore(name)

      const request = store.add(value)

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
    }
  })

export { seed, get, create }

/* v8 ignore stop */
