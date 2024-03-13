export type Get<T> = (key: number | string) => Promise<T>
export type GetAll<T> = () => Promise<T>

export type Add<I, O> = (value: I, key?: number | string) => Promise<O>
export type Put<I, O> = (value: I, key?: number | string) => Promise<O>
export type Remove = (key: number | string) => Promise<void>
export type Clear = () => Promise<void>
