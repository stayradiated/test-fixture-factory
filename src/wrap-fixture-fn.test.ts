import { test, vi } from 'vitest'

import { createSchema } from './schema-utils.js'
import { wrapFixtureFn } from './wrap-fixture-fn.js'

test('should pass through input/output', ({ expect }) => {
  const spy = vi.fn().mockReturnValue('world')
  const test = wrapFixtureFn<
    Record<string, never>,
    Record<string, never>,
    string
  >({}, spy)
  expect((test as unknown as (input: string) => string)('hello')).toBe('world')
  expect(spy).toHaveBeenCalledOnce()
  expect(spy).toHaveBeenCalledWith('hello')
})

test('should wrap a function with no dependencies', ({ expect }) => {
  const spy = vi.fn()
  const test = wrapFixtureFn({}, spy)
  expect(test.toString()).toMatchInlineSnapshot(`"({}) => true"`)
})

test('should wrap a function with dependencies (arrow)', ({ expect }) => {
  const schema = createSchema<{ name: string }>().with((f) => ({
    value: f.type<string>().from('name'),
  }))

  const spy = vi.fn()
  const test = wrapFixtureFn(schema, spy)
  expect(test.toString()).toMatchInlineSnapshot(`"({ name }) => true"`)
})

test('should wrap a function with dependencies (function)', ({ expect }) => {
  const schema = createSchema<{ user: { name: string } }>().with((f) => ({
    value: f.type<string>().from('user', ({ user }) => user.name),
  }))
  const spy = vi.fn()
  const test = wrapFixtureFn(schema, spy)
  expect(test.toString()).toMatchInlineSnapshot(`"({ user }) => true"`)
})

test('should use dep name from decode fn', ({ expect }) => {
  const schema = createSchema<{ user: { name: string } }>().with((f) => ({
    value: f.type<string>().from('user', ({ user }) => user.name),
  }))
  const spy = vi.fn()
  const test = wrapFixtureFn(schema, spy)
  expect(test.toString()).toMatchInlineSnapshot(`"({ user }) => true"`)
})

test('should wrap a function with dependencies and attributes', ({
  expect,
}) => {
  const schema = createSchema<{ name: string; age: number }>().with((f) => ({
    valueA: f.type<string>().from('name'),
    valueB: f.type<number>().from('age'),
    valueC: f.type<string>().optional(),
  }))
  const spy = vi.fn()
  const test = wrapFixtureFn(schema, spy)
  expect(test.toString()).toMatchInlineSnapshot(`"({ name, age }) => true"`)
})
