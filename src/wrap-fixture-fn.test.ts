import { test, vi } from 'vitest'

import { f } from './field-builder.js'
import { wrapFixtureFn } from './wrap-fixture-fn.js'

test('should pass through input/output', ({ expect }) => {
  const spy = vi.fn().mockReturnValue('world')
  const test = wrapFixtureFn({}, spy)
  expect(test('hello')).toBe('world')
  expect(spy).toHaveBeenCalledOnce()
  expect(spy).toHaveBeenCalledWith('hello')
})

test('should wrap a function with no dependencies', ({ expect }) => {
  const spy = vi.fn()
  const test = wrapFixtureFn({}, spy)
  expect(test.toString()).toMatchInlineSnapshot(`"({}) => true"`)
})

test('should wrap a function with dependencies (arrow)', ({ expect }) => {
  const spy = vi.fn()
  const test = wrapFixtureFn(
    {
      value: f.type<string>().useContext(({ name }: { name: string }) => name),
    },
    spy,
  )
  expect(test.toString()).toMatchInlineSnapshot(`"({ name }) => true"`)
})

test('should wrap a function with dependencies (function)', ({ expect }) => {
  const spy = vi.fn()
  const test = wrapFixtureFn(
    {
      value: f
        .type<string>()
        .useContext(({ user }: { user: { name: string } }) => user.name),
    },
    spy,
  )
  expect(test.toString()).toMatchInlineSnapshot(`"({ user }) => true"`)
})

test('should use dep name from decode fn', ({ expect }) => {
  const spy = vi.fn()
  const test = wrapFixtureFn(
    {
      name: f
        .type<string>()
        .useContext(({ user }: { user: { name: string } }) => user.name),
    },
    spy,
  )
  expect(test.toString()).toMatchInlineSnapshot(`"({ user }) => true"`)
})

test('should wrap a function with dependencies and attributes', ({
  expect,
}) => {
  const spy = vi.fn()
  const test = wrapFixtureFn(
    {
      valueA: f.type<string>().useContext(({ name }: { name: string }) => name),
      valueB: f
        .type<number>()
        .optional()
        .useContext(({ age }: { age: number }) => age),
      valueC: f.type<string>().optional(),
    },
    spy,
  )
  expect(test.toString()).toMatchInlineSnapshot(`"({ name, age }) => true"`)
})
