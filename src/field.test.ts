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
      getValueFromContext: undefined,
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
      getValueFromContext: undefined,
    })
  })

  test('.type().from(fn)', ({ expect }) => {
    const f = createFieldBuilder<{ dependency: string }>()

    const field = f
      .type<boolean>()
      .from('dependency', ({ dependency }) => dependency === 'true')

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ dependency: string }, 'dependency', boolean, 'from'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: ['dependency'],
      isRequired: true,
      defaultValue: undefined,
      getValueFromContext: expect.any(Function),
    })
  })

  test('.type().maybeFrom(fn)', ({ expect }) => {
    const f = createFieldBuilder<{ value?: string }>()
    const field = f.type<bigint>().maybeFrom('value', ({ value }) => {
      return typeof value === 'string' ? BigInt(value) : undefined
    })

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ value?: string }, 'value', bigint, 'maybeFrom'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: ['value'],
      isRequired: true,
      defaultValue: undefined,
      getValueFromContext: expect.any(Function),
    })
  })

  test('.type().default(value)', ({ expect }) => {
    const f = createFieldBuilder()
    const field = f.type<string>().default('default')

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, never, string, 'default'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: [],
      isRequired: true,
      defaultValue: 'default',
      getValueFromContext: undefined,
    })
  })

  test('.type().default(value).optional()', ({ expect }) => {
    const f = createFieldBuilder()
    const field = f.type<number>().default(123).optional()

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, never, number | undefined, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: [],
      isRequired: false,
      defaultValue: 123,
      getValueFromContext: undefined,
    })
  })

  test('.type().default(fn)', ({ expect }) => {
    const f = createFieldBuilder()
    const field = f.type<string>().default(() => 'default')

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, never, string, 'default'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: [],
      isRequired: true,
      defaultValue: expect.any(Function),
      getValueFromContext: undefined,
    })
  })

  test('.type().from(fn)', ({ expect }) => {
    const f = createFieldBuilder<{ value?: string }>()

    const field = f
      .type<boolean>()
      .from('value', ({ value }) => value === 'true')

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ value?: string }, 'value', boolean, 'from'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: ['value'],
      isRequired: true,
      defaultValue: undefined,
      getValueFromContext: expect.any(Function),
    })
  })

  test('.type().maybeFrom(fn)', ({ expect }) => {
    const f = createFieldBuilder<{ value?: string }>()

    const field = f.type<bigint>().maybeFrom('value', ({ value }) => {
      return typeof value === 'string' ? BigInt(value) : undefined
    })

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ value?: string }, 'value', bigint, 'maybeFrom'>
    >()

    expect(inspect(field)).toStrictEqual<AnyField>({
      fixtureList: ['value'],
      isRequired: true,
      defaultValue: undefined,
      getValueFromContext: expect.any(Function),
    })
  })
})
