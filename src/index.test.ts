import { Polyfill, Polyfills, applyPolyfills } from "."

function polyfillFactory(
  shouldBeApplied = true,
  name = "test polyfill",
  polyfill = jest.fn(() => Promise.resolve())
): Polyfill {
  return {
    name,
    test: () => !shouldBeApplied,
    polyfill
  }
}

test("logger", async () => {
  const testValues: Polyfills = [ [ polyfillFactory() ] ]

  const logger = jest.fn()
  await applyPolyfills(testValues, {
    debug: true,
    logger
  })
  expect(logger).toMatchSnapshot()
})

test("polyfill applied", async () => {
  const polyfill = polyfillFactory()
  const testValues: Polyfills = [ [ polyfill ] ]

  await applyPolyfills(testValues)
  expect(polyfill.polyfill).toHaveBeenCalledTimes(1)
})

test("polyfill execution order", async () => {
  const result = []

  // eslint-disable-next-line jest/valid-expect-in-promise
  const mockFacktory = (id) =>
    Promise.resolve().then(() => {
      result.push(id)
    })

  const polyfill1 = polyfillFactory(true, "test polyfill", jest.fn(() => mockFacktory(1)))
  const polyfill2 = polyfillFactory(true, "test polyfill", jest.fn(() => mockFacktory(2)))
  const polyfill3 = polyfillFactory(true, "test polyfill", jest.fn(() => mockFacktory(3)))

  const testValues: Polyfills = [ [ polyfill1 ], [ polyfill2 ], [ polyfill3 ] ]
  await applyPolyfills(testValues)
  expect(result).toMatchSnapshot()
})
