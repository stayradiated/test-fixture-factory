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
      isRequired: false,
      defaultValue: undefined,
    })
  })

  test('.type().default(fn)', ({ expect }) => {
    const f = createFieldBuilder<{
      dependency: boolean
    }>()

    const field = f
      .type<boolean>()
      .dependsOn('dependency')
      .default(({ dependency }) => dependency)

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ dependency: boolean }, 'dependency', boolean, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: ['dependency'],
      isRequired: false,
      defaultValue: expect.any(Function),
    })
  })

  test('.type().default(fn).optional()', ({ expect }) => {
    const f = createFieldBuilder<{ value?: string }>()
    const field = f
      .type<bigint>()
      .optional()
      .dependsOn('value')
      .default(({ value }) => {
        return typeof value === 'string' ? BigInt(value) : undefined
      })

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ value?: string }, 'value', bigint | undefined, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: ['value'],
      isRequired: false,
      defaultValue: expect.any(Function),
    })
  })

  test('.type().default()', ({ expect }) => {
    const f = createFieldBuilder()
    const field = f.type<string>().default('default')

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, never, string, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: [],
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
      isRequired: false,
      defaultValue: 123,
    })
  })

  test('.type().default(fn)', ({ expect }) => {
    const f = createFieldBuilder<{ value?: string }>()

    const field = f
      .type<boolean>()
      .dependsOn('value')
      .default(({ value }) => value === 'true')

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ value?: string }, 'value', boolean, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: ['value'],
      isRequired: false,
      defaultValue: expect.any(Function),
    })
  })

  test('.type().optionalDefault(fn)', ({ expect }) => {
    const f = createFieldBuilder<{ value?: string }>()

    const field = f
      .type<bigint>()
      .dependsOn('value')
      .optionalDefault(({ value }) => {
        return typeof value === 'string' ? BigInt(value) : undefined
      })

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ value?: string }, 'value', bigint, 'required'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: ['value'],
      isRequired: true,
      defaultValue: expect.any(Function),
    })
  })
})
