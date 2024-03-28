import { InvalidateCallback, InvalidateKey } from '@/types'

let instance: InvalidationManager | undefined = undefined
const callbacks = new Map<string, InvalidateCallback[]>()

class InvalidationManager {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    instance = this
  }

  registerCallback = (key: InvalidateKey, callback: InvalidateCallback) => {
    const safeKey = JSON.stringify(key)

    if (!callbacks.has(safeKey)) {
      callbacks.set(safeKey, [callback])
    }

    callbacks.get(safeKey)?.push(callback)
  }

  unregisterCallback = (key: InvalidateKey, callback: InvalidateCallback) => {
    const safeKey = JSON.stringify(key)

    if (!callbacks.has(safeKey)) return

    const newCallbacks = callbacks.get(safeKey)?.filter((cb) => cb !== callback)

    if (newCallbacks) {
      callbacks.set(safeKey, newCallbacks)
    } else {
      callbacks.delete(safeKey)
    }
  }

  invalidate = (key: InvalidateKey) => {
    const safeKey = JSON.stringify(key)

    if (!callbacks.has(safeKey)) {
      return
    }

    callbacks.get(safeKey)?.forEach((callback) => callback())
  }

  reset = () => {
    callbacks.clear()
  }
}

export const invalidationManager = instance ?? new InvalidationManager()
