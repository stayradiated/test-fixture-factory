import { describe, expectTypeOf, test } from 'vitest'
import { type FieldBuilder, f } from './field-builder.js'
import type { Field, RequiredFlag } from './types.js'

const inspect = <Context extends object, Value, Flag extends RequiredFlag>(
  fieldBuilder: FieldBuilder<Context, Value, Flag>,
): Field<Context, Value, Flag> => {
  const field = fieldBuilder as unknown as Field<Context, Value, Flag>
  return {
    context: field.context,
    isRequired: field.isRequired,
    defaultValue: field.defaultValue,
  }
}

describe('f', () => {
  test('.type()', ({ expect }) => {
    const field = f.type<string>()

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, string, 'required'>
    >()

    expect(inspect(field)).toStrictEqual({
      context: undefined,
      isRequired: true,
      defaultValue: undefined,
    })
  })

  test('.type().optional()', ({ expect }) => {
    const field = f.type<number>().optional()

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, number | undefined, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual({
      context: undefined,
      isRequired: false,
      defaultValue: undefined,
    })
  })

  test('.type().useContext()', ({ expect }) => {
    const field = f
      .type<boolean>()
      .useContext(({ dependency }: { dependency: boolean }) => dependency)

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ dependency: boolean }, boolean, 'required'>
    >()

    expect(inspect(field)).toStrictEqual({
      context: {
        fixtureList: ['dependency'],
        getValue: expect.any(Function),
      },
      isRequired: true,
      defaultValue: undefined,
    })
    expect(inspect(field).context?.getValue({ dependency: true })).toBe(true)
  })

  test('.type().useContext().optional()', ({ expect }) => {
    const field = f
      .type<bigint>()
      .optional()
      .useContext(({ value }: { value?: string }) => {
        try {
          return typeof value === 'string' ? BigInt(value) : undefined
        } catch {
          return undefined
        }
      })

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ value?: string }, bigint | undefined, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual({
      context: {
        fixtureList: ['value'],
        getValue: expect.any(Function),
      },
      isRequired: false,
      defaultValue: undefined,
    })
    expect(inspect(field).context?.getValue?.({ value: '1234' })).toBe(1234n)
    expect(inspect(field).context?.getValue?.({ value: 'fail' })).toBe(
      undefined,
    )
  })

  test('.type().default()', ({ expect }) => {
    const field = f.type<string>().default('default')

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, string, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual({
      context: undefined,
      isRequired: false,
      defaultValue: 'default',
    })
  })

  test('.type().default().optional()', ({ expect }) => {
    const field = f.type<number>().default(123).optional()

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, number | undefined, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual({
      context: undefined,
      isRequired: false,
      defaultValue: 123,
    })
  })

  test('.type().useContext().default()', ({ expect }) => {
    const field = f
      .type<boolean>()
      .default(false)
      .useContext(({ value }: { value?: string }) => value === 'true')

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ value?: string }, boolean, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual({
      context: {
        fixtureList: ['value'],
        getValue: expect.any(Function),
      },
      isRequired: false,
      defaultValue: false,
    })
    expect(inspect(field).context?.getValue?.({ value: 'true' })).toBe(true)
    expect(inspect(field).context?.getValue?.({ value: 'fail' })).toBe(false)
  })

  test('.type().useContext().default().optional()', ({ expect }) => {
    const field = f
      .type<bigint>()
      .default(123n)
      .optional()
      .useContext(({ value }: { value?: string }) => {
        try {
          return typeof value === 'string' ? BigInt(value) : undefined
        } catch {
          return undefined
        }
      })

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ value?: string }, bigint | undefined, 'optional'>
    >()

    expect(inspect(field)).toStrictEqual({
      context: {
        fixtureList: ['value'],
        getValue: expect.any(Function),
      },
      isRequired: false,
      defaultValue: 123n,
    })
    expect(inspect(field).context?.getValue?.({ value: '1234' })).toBe(1234n)
    expect(inspect(field).context?.getValue?.({ value: 'fail' })).toBe(
      undefined,
    )
  })
})
