import { PubSubInterface, WrapperEvents, WrapperReturnType } from './types'

export const wrapPubSub = <E extends WrapperEvents>(
  clientInterface: PubSubInterface | (() => PubSubInterface)
): WrapperReturnType<E> => {
  const subs: Record<string, unknown[]> = {} // channel -> events[]

  return {
    publish: async <K extends keyof E>(channel: string, event: K, payload: E[K]) => {
      const client = typeof clientInterface === 'function' ? clientInterface() : clientInterface
      const message = JSON.stringify({ event, payload })
      await client.publish(channel, message)
    },
    subscribe: async <K extends keyof E>(channel: string, event: K, handler: (message: E[K]) => void) => {
      const client = typeof clientInterface === 'function' ? clientInterface() : clientInterface

      if (!subs[channel]) {
        subs[channel] = []
      }

      subs[channel].push(event)

      await client.subscribe(channel, (message: string) => {
        try {
          const parsed: { event: K; payload: E[K] } = JSON.parse(message)
          if (parsed.event === event) {
            if (!subs[channel]?.includes(event)) {
              return
            }

            handler(parsed.payload)
          }
        } catch (error) {
          console.error('Error parsing message:', error)
        }
      })
    },
    unsubscribe: async <K extends keyof E>(channel: string, event: K) => {
      const client = typeof clientInterface === 'function' ? clientInterface() : clientInterface

      if (subs[channel]) {
        const eventIndex = subs[channel].indexOf(event)
        if (eventIndex !== -1) {
          subs[channel].splice(eventIndex, 1)
        }

        if (subs[channel].length === 0) {
          delete subs[channel]
          await client.unsubscribe(channel)
        }
      }
    },
  }
}
