export type ObjectStore = {
  name: string;
  options?: IDBObjectStoreParameters;
  indices?: {
    name: string;
    keyPath: string;
    options?: IDBIndexParameters;
  }[];
};

export type IndexedDBConfig = {
  name: string;
  version: number;
  objectStores: ObjectStore[];
};
