import type { FactoryInputFn, VitestFixtureFn } from './types.js'

/*
 * https://vitest.dev/guide/test-context.html#test-extend
 *
 * > When using test.extend() with fixtures, you should always use the object
 * > destructuring pattern { todos } to access context both in fixture function
 * > and test function.
 *
 * // must use object destructuring
 * test('', ({ todos }) => {})
 *
 * // this does not work
 * test('', (deps) => { deps.todos })
 */
const defineFixture = <Deps, Attrs, FatoryValue, FixtureValue>(
  factoryFn: FactoryInputFn<Deps, Attrs, FatoryValue>,
  fixtureFn: VitestFixtureFn<Deps, FixtureValue>,
): VitestFixtureFn<Deps, FixtureValue> => {
  // do not modify any of the inputs, instead create a new function
  const wrappedFn: VitestFixtureFn<Deps, FixtureValue> = (deps, use) => {
    return fixtureFn(deps, use)
  }

  // overwrite the .toString() method to return the original factory function
  // this is necessary for vitest to know which dependencies are used by the
  // fixture
  wrappedFn.toString = () => {
    return factoryFn.toString()
  }

  return wrappedFn
}

export { defineFixture }
