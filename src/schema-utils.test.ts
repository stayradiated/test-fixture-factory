import { describe, test } from 'vitest'

import { f } from './field-builder.js'
import {
  getFixtureList,
  resolveSchema,
  validateSchemaData,
} from './schema-utils.js'

describe('resolveSchema', () => {
  test('should resolve default values', ({ expect }) => {
    const schema = {
      a: f.type<number>().default(1),
      b: f.type<number>().default(2),
      c: f.type<number>().default(3),
    }

    const result = resolveSchema(schema, {}, {})

    expect(result).toStrictEqual({
      a: 1,
      b: 2,
      c: 3,
    })
  })

  test('should resolve deps', ({ expect }) => {
    const schema = {
      a: f.type<number>().useContext(({ a }: { a: number }) => a),
      b: f.type<number>().useContext(({ b }: { b: number }) => b),
      c: f.type<number>().useContext(({ c }: { c: number }) => c),
    }

    const result = resolveSchema(schema, { a: 1, b: 2, c: 3 }, {})

    expect(result).toStrictEqual({
      a: 1,
      b: 2,
      c: 3,
    })
  })

  test('should resolve attrs', ({ expect }) => {
    const schema = {
      a: f.type<number>(),
      b: f.type<number>(),
      c: f.type<number>(),
    }

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
    const schema = {
      a: f.type<number>(),
      b: f.type<number>(),
      c: f.type<number>(),
    }

    const result = validateSchemaData(schema, { a: 1, b: 2, c: 3 })

    expect(result).toStrictEqual([])
  })

  test('should validate schema data with missing fields', ({ expect }) => {
    const schema = {
      a: f.type<number>(),
      b: f.type<number>(),
      c: f.type<number>(),
    }

    const result = validateSchemaData(schema, {
      a: 1,
      b: 2,
      c: undefined as unknown as number,
    })

    expect(result).toStrictEqual([['c', schema.c]])
  })
})

describe('getFixtureList', () => {
  test('should get fixture list', ({ expect }) => {
    const schema = {
      a: f.type<number>().useContext(({ a }: { a: number }) => a),
      b: f.type<number>().useContext(({ b }: { b: number }) => b),
      c: f.type<number>().useContext(({ c }: { c: number }) => c),
    }

    const result = getFixtureList(schema)

    expect(result).toStrictEqual(['a', 'b', 'c'])
  })
})
