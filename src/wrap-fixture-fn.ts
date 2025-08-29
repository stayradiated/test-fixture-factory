import { getFixtureList } from './schema-utils.js'
import type { AnySchema } from './types.js'

// biome-ignore lint/suspicious/noExplicitAny: this is ok
type AnyFn = (...args: any[]) => any

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

const wrapFixtureFn = <S extends AnySchema, Fn extends AnyFn>(
  schema: S,
  fn: Fn,
): Fn => {
  const wrapped = ((...args: Parameters<Fn>): ReturnType<Fn> =>
    fn(...args)) as Fn

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
