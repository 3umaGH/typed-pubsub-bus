export type PubSubInterface = {
  publish: (channel: string, message: string) => Promise<void>
  subscribe: (channel: string, handler: (message: string) => void) => Promise<void>
  unsubscribe: (channel: string) => Promise<void>
}

export type WrapperReturnType<E extends WrapperEvents> = {
  publish: <K extends keyof E>(channel: string, event: K, payload: E[K]) => Promise<void>
  subscribe: <K extends keyof E>(channel: string, event: K, handler: (payload: E[K]) => void) => Promise<void>
  unsubscribe: <K extends keyof E>(channel: string, event: K) => Promise<void>
}

export type WrapperEvents = Record<string, unknown>
