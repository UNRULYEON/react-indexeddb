export type Key = (number | string | undefined)[]

export type Listener = (cache: unknown) => void

export type InvalidateCallback = () => void
