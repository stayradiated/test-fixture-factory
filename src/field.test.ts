import { describe, expectTypeOf, test } from 'vitest'

import type { FieldBuilder } from './field.js'
import type { AnyField, Field, RequiredFlag } from './types.js'

import { createFieldBuilder } from './field.js'

const inspect = <
  Context extends object,
  Fixtures extends keyof Context & string,
  Value,
  Flag extends RequiredFlag,
>(
  field: FieldBuilder<Context, Fixtures, Value, Flag>,
): Field<Pick<Context, Fixtures>, Value, Flag> => {
  const { state } = field as unknown as {
    state: Field<Pick<Context, Fixtures>, Value, Flag>
  }
  return state
}

describe('createFieldFactory', () => {
  test('.type()', ({ expect }) => {
    const f = createFieldBuilder()
    const field = f.type<string>()

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, never, string, 'required'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: [],
      fromContext: undefined,
      isRequired: true,
      defaultValue: undefined,
    })
  })

  test('.type().optional()', ({ expect }) => {
    const f = createFieldBuilder()
    const field = f.type<number>().optional()

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, never, number | undefined, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: [],
      fromContext: undefined,
      isRequired: false,
      defaultValue: undefined,
    })
  })

  test('.type().use()', ({ expect }) => {
    const f = createFieldBuilder<{
      dependency: boolean
    }>()

    const field = f
      .type<boolean>()
      .dependsOn('dependency')
      .use(({ dependency }) => dependency)

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ dependency: boolean }, 'dependency', boolean, 'required'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: ['dependency'],
      fromContext: expect.any(Function),
      isRequired: true,
      defaultValue: undefined,
    })
    expect(inspect(field).fromContext?.({ dependency: true })).toBe(true)
  })

  test('.type().use().optional()', ({ expect }) => {
    const f = createFieldBuilder<{ value?: string }>()
    const field = f
      .type<bigint>()
      .optional()
      .dependsOn('value')
      .use(({ value }) => {
        try {
          return typeof value === 'string' ? BigInt(value) : undefined
        } catch {
          return undefined
        }
      })

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ value?: string }, 'value', bigint | undefined, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: ['value'],
      fromContext: expect.any(Function),
      isRequired: false,
      defaultValue: undefined,
    })
    expect(inspect(field).fromContext?.({ value: '1234' })).toBe(1234n)
    expect(inspect(field).fromContext?.({ value: 'fail' })).toBe(undefined)
  })

  test('.type().default()', ({ expect }) => {
    const f = createFieldBuilder()
    const field = f.type<string>().default('default')

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, never, string, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: [],
      fromContext: undefined,
      isRequired: false,
      defaultValue: 'default',
    })
  })

  test('.type().default().optional()', ({ expect }) => {
    const f = createFieldBuilder()
    const field = f.type<number>().default(123).optional()

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, never, number | undefined, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: [],
      fromContext: undefined,
      isRequired: false,
      defaultValue: 123,
    })
  })

  test('.type().use().default()', ({ expect }) => {
    const f = createFieldBuilder<{ value?: string }>()

    const field = f
      .type<boolean>()
      .default(false)
      .dependsOn('value')
      .use(({ value }) => value === 'true')

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ value?: string }, 'value', boolean, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: ['value'],
      fromContext: expect.any(Function),
      isRequired: false,
      defaultValue: false,
    })
    expect(inspect(field).fromContext?.({ value: 'true' })).toBe(true)
    expect(inspect(field).fromContext?.({ value: 'fail' })).toBe(false)
  })

  test('.type().use().default().optional()', ({ expect }) => {
    const f = createFieldBuilder<{ value?: string }>()

    const field = f
      .type<bigint>()
      .default(123n)
      .optional()
      .dependsOn('value')
      .use(({ value }) => {
        try {
          return typeof value === 'string' ? BigInt(value) : undefined
        } catch {
          return undefined
        }
      })

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ value?: string }, 'value', bigint | undefined, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: ['value'],
      fromContext: expect.any(Function),
      isRequired: false,
      defaultValue: 123n,
    })
    expect(inspect(field).fromContext?.({ value: '1234' })).toBe(1234n)
    expect(inspect(field).fromContext?.({ value: 'fail' })).toBe(undefined)
  })
})
