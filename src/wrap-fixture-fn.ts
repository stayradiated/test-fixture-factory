import type { AnySchema, VitestFixtureFn } from './types.js'

import { getFixtureList } from './schema-utils.js'

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

const wrapFixtureFn = <C extends object, S extends AnySchema, V>(
  schema: S,
  fn: VitestFixtureFn<C, V>,
): VitestFixtureFn<C, V> => {
  const wrapped: VitestFixtureFn<C, V> = (...args) => {
    return fn(...args)
  }

  // compute the dep list from your schema
  const fixtureList = getFixtureList(schema)
  const fixtureListString =
    fixtureList.length === 0 ? '' : ` ${fixtureList.join(', ')} `

  // override toString so Vitest can “see” the destructured deps
  // and provide the correct fixtures to the test function
  wrapped.toString = () => {
    return `({${fixtureListString}}) => true`
  }

  return wrapped
}

export { wrapFixtureFn }
