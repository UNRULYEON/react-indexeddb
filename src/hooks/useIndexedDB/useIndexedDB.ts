import { useContext, useState, useCallback, useEffect } from 'react';
import { Key, Get, GetAll } from '@/types';
import { IndexedDBContext } from '@/contexts/IndexedDBProvider';

type Options = {
  enabled: boolean;
};

type UseIndexedDBParameters<T> = {
  name: string;
  key: Key;
  fn: (methods: { get: Get<T>; getAll: GetAll<T> }) => Promise<T>;
} & Partial<Options>;

export const useIndexedDB = <T>({
  name,
  key,
  fn,
  enabled = true,
}: UseIndexedDBParameters<T>) => {
  const context = useContext(IndexedDBContext);

  if (!context)
    throw new Error('useIndexedDB must be used within an IndexedDBProvider');

  const [data, setData] = useState<T | undefined>(undefined);

  const get = useCallback<Get<T>>(
    (key) => {
      return new Promise((resolve, reject) => {
        if (!context.db) return reject();

        const transaction = (context.db as IDBDatabase).transaction(
          name,
          'readonly'
        );
        const store = transaction.objectStore(name);

        const request = store.get(key);

        request.onsuccess = (event) => {
          resolve((event.target as IDBRequest<T>).result);
        };

        request.onerror = (event) => {
          reject(event);
        };
      });
    },
    [context.db, name]
  );

  const getAll = useCallback(() => {
    return new Promise<T>((resolve, reject) => {
      if (!context.db) return reject();

      const transaction = (context.db as IDBDatabase).transaction(
        name,
        'readonly'
      );
      const store = transaction.objectStore(name);

      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest<T>).result);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  }, [context.db, name]);

  const runFn = async () => {
    if (!context.db) return;

    const result = await fn({ get, getAll });

    setData(result);
  };

  const invalidationCallback = () => {
    runFn();
  };

  useEffect(() => {
    if (!context.db || !enabled) return;

    runFn();
    context.registerInvalidationCallback(key, invalidationCallback);
  }, [context.db, enabled]);

  return {
    data,
  };
};
