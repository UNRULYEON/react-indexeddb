import { ReactNode, createContext, useEffect, useRef, useState } from 'react'
import { IndexedDBConfig, InvalidateCallback, Key } from '@/types'

type IndexedDBState = {
  db: IDBDatabase | undefined
  registerInvalidationCallback: (
    keys: Key,
    callback: InvalidateCallback,
  ) => void
  invalidateKeys: (keys: Key) => void
}

export const IndexedDBContext = createContext<IndexedDBState | undefined>(
  undefined,
)

type IndexedDBProps = {
  config: IndexedDBConfig
  children: ReactNode
}

export const IndexedDBProvider = ({ config, children }: IndexedDBProps) => {
  const [db, setDb] = useState<IDBDatabase | undefined>(undefined)
  const keyManager = useRef(new Map<string, InvalidateCallback[]>())

  useEffect(() => {
    if (!db) initialise(config)
  }, [db])

  useEffect(() => {
    if (!db) return

    db.onerror = (event) => {
      console.error('indexeddb error', event)
    }

    db.onabort = (event) => {
      console.error('indexeddb abort', event)
    }

    db.onclose = (event) => {
      console.error('indexeddb close', event)
    }
  }, [db])

  const initialise = (config: IndexedDBProps['config']) => {
    const { name, version } = config

    const request = indexedDB.open(name, version)

    request.onupgradeneeded = (event) => {
      // @ts-expect-error - TS doesn't know about the correct type
      const db = event.target.result as IDBDatabase

      config.objectStores.forEach((objectStore) => {
        const store = db.createObjectStore(
          objectStore.name,
          objectStore.options,
        )

        objectStore.indices?.forEach((index) => {
          store.createIndex(index.name, index.keyPath, index.options)
        })
      })
    }

    request.onerror = (event) => {
      console.error('Error opening IndexedDB', event)
    }

    request.onsuccess = (event) => {
      // @ts-expect-error - TS doesn't know about the correct type
      setDb(event.target.result)
    }
  }

  const registerInvalidationCallback = (
    keys: Key,
    callback: InvalidateCallback,
  ) => {
    const keysString = JSON.stringify(keys)

    if (!keyManager.current.has(keysString)) {
      keyManager.current.set(keysString, [])
    }

    keyManager.current.get(keysString)?.push(callback)
  }

  const invalidateKeys = (keys: Key) => {
    const keysString = JSON.stringify(keys)

    if (!keyManager.current.has(keysString)) return

    keyManager.current.get(keysString)?.forEach((callback) => callback())
  }

  return (
    <IndexedDBContext.Provider
      value={{ db, registerInvalidationCallback, invalidateKeys }}
    >
      {children}
    </IndexedDBContext.Provider>
  )
}

export default IndexedDBProvider
