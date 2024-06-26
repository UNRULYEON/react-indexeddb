import { useContext } from 'react'
import { IndexedDBContext } from '@/contexts/IndexedDBProvider'
import { invalidationManager } from '@/singletons'

export const useInvalidate = () => {
  const context = useContext(IndexedDBContext)

  if (!context)
    throw new Error('useIndexedDB must be used within an IndexedDBProvider')

  return {
    invalidate: invalidationManager.invalidate,
  }
}
