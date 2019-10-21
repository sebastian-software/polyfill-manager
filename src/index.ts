export type PolyfillFunction = () => Promise<void>

export interface Polyfill {
  /** Name of polyfill */
  name: string

  /** Test if polyfill is needed. Polyfill is applied if test() returns false. */
  test: () => boolean

  /** Polyfill to be applied */
  polyfill: PolyfillFunction
}
export type Polyfills = Polyfill[][]
export interface PolyfillManagerOptions {
  debug?: boolean
  logger?: (...args) => void
}

function annotatePolyfillFactory(options: PolyfillManagerOptions) {
  return (polyfill: Polyfill): Polyfill => ({
    ...polyfill,
    polyfill: () => {
      if (options.debug) {
        options.logger("Execute", polyfill.name)
      }
      return polyfill
        .polyfill()
        .then(() => {
          if (options.debug) {
            options.logger(polyfill.name, "successfully loaded")
          }
        })
        .catch((error) => {
          if (options.debug) {
            options.logger(`Failed to load ${polyfill.name}`, { error })
          }
          throw error
        })
    }
  })
}

export async function applyPolyfills(
  polyfills: Polyfills,
  options: PolyfillManagerOptions = {}
) {
  const annotatePolyfill = annotatePolyfillFactory(options)

  while (polyfills.length > 0) {
    const polyfillsInOrder = polyfills.shift()

    if (polyfillsInOrder) {
      const polyfillsToExecute = polyfillsInOrder
        .map(annotatePolyfill)
        .filter((polyfill) => !polyfill.test())
        .map((polyfill) => polyfill.polyfill())

      // await is intended here to support dependent polyfills (like intl support -> intl)
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(polyfillsToExecute)
    }
  }
}
