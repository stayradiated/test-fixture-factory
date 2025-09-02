import { describe, test } from 'vitest'

import {
  createSchema,
  getFixtureList,
  resolveSchema,
  validateSchemaData,
} from './schema-utils.js'

describe('resolveSchema', () => {
  test('should resolve default values', ({ expect }) => {
    const schema = createSchema().with((f) => ({
      a: f.type<number>().default(1),
      b: f.type<number>().default(2),
      c: f.type<number>().default(() => 3),
    }))

    const result = resolveSchema(schema, {}, {})

    expect(result).toStrictEqual({
      a: 1,
      b: 2,
      c: 3,
    })
  })

  test('should resolve deps', ({ expect }) => {
    const schema = createSchema<{ a: number; b: number; c: number }>().with(
      (f) => ({
        a: f
          .type<number>()
          .dependsOn('a')
          .default(({ a }) => a),
        b: f
          .type<number>()
          .dependsOn('b')
          .default(({ b }) => b),
        c: f
          .type<number>()
          .dependsOn('c')
          .default(({ c }) => c),
      }),
    )

    const result = resolveSchema(schema, { a: 1, b: 2, c: 3 }, {})

    expect(result).toStrictEqual({
      a: 1,
      b: 2,
      c: 3,
    })
  })

  test('should resolve attrs', ({ expect }) => {
    const schema = createSchema().with((f) => ({
      a: f.type<number>(),
      b: f.type<number>(),
      c: f.type<number>(),
    }))

    const result = resolveSchema(schema, {}, { a: 1, b: 2, c: 3 })

    expect(result).toStrictEqual({
      a: 1,
      b: 2,
      c: 3,
    })
  })
})

describe('validateSchemaData', () => {
  test('should validate schema data', ({ expect }) => {
    const schema = createSchema().with((f) => ({
      a: f.type<number>(),
      b: f.type<number>(),
      c: f.type<number>(),
    }))

    const result = validateSchemaData(schema, { a: 1, b: 2, c: 3 })

    expect(result).toStrictEqual([])
  })

  test('should validate schema data with missing fields', ({ expect }) => {
    const schema = createSchema().with((f) => ({
      a: f.type<number>(),
      b: f.type<number>(),
      c: f.type<number>(),
    }))

    const result = validateSchemaData(schema, {
      a: 1,
      b: 2,
      c: undefined as unknown as number,
    })

    expect(result).toStrictEqual([
      {
        key: 'c',
        fixtureList: [],
      },
    ])
  })
})

describe('getFixtureList', () => {
  test('should get fixture list', ({ expect }) => {
    const schema = createSchema<{ a: number; b: number; c: number }>().with(
      (f) => ({
        a: f
          .type<number>()
          .dependsOn('a')
          .default(({ a }) => a),
        bc: f
          .type<number>()
          .dependsOn('b', 'c')
          .default(({ b, c }) => b + c),
      }),
    )

    const result = getFixtureList(schema)

    expect(result).toStrictEqual(['a', 'b', 'c'])
  })
})
