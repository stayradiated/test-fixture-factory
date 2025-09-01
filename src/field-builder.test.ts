import { describe, expectTypeOf, test } from 'vitest'
import { type FieldBuilder, f } from './field-builder.js'
import type { Field } from './types.js'

const inspect = <Context extends object, Value, IsOptional extends boolean>(
  fieldBuilder: FieldBuilder<Context, Value, IsOptional>,
): Field<Context, Value, IsOptional> => {
  const field = fieldBuilder as unknown as Field<Context, Value, IsOptional>
  return {
    context: field.context,
    isOptional: field.isOptional,
  }
}

describe('f', () => {
  test('build a required attribute', ({ expect }) => {
    const field = f.type<string>()

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, string, false>
    >()

    expect(inspect(field)).toStrictEqual({
      context: undefined,
      isOptional: false,
    })
  })

  test('build an optional attribute', ({ expect }) => {
    const field = f.type<number>().optional()

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<object, number, true>
    >()

    expect(inspect(field)).toStrictEqual({
      context: undefined,
      isOptional: true,
    })
  })

  test('build a required dependency', ({ expect }) => {
    const field = f
      .type<boolean>()
      .useContext(({ dependency }: { dependency: boolean }) => dependency)

    expectTypeOf<typeof field>().toEqualTypeOf<
      FieldBuilder<{ dependency: boolean }, boolean, false>
    >()

    expect(inspect(field)).toStrictEqual({
      context: {
        fixtureList: ['dependency'],
        getValue: expect.any(Function),
      },
      isOptional: false,
    })
    expect(inspect(field).context?.getValue({ dependency: true })).toBe(true)
  })

  test('build an optional dependency', ({ expect }) => {
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
      FieldBuilder<{ value?: string }, bigint, true>
    >()

    expect(inspect(field)).toStrictEqual({
      context: {
        fixtureList: ['value'],
        getValue: expect.any(Function),
      },
      isOptional: true,
    })
    expect(inspect(field).context?.getValue?.({ value: '1234' })).toBe(1234n)
    expect(inspect(field).context?.getValue?.({ value: 'fail' })).toBe(
      undefined,
    )
  })
})
