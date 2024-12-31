import { describe, expectTypeOf, test } from 'vitest'
import { defineFactory } from './define-factory.js'
import type { InferFixtureValue } from './types.js'

describe('InferFixtureValue', () => {
  test('should infer the correct create function type', () => {
    type Attrs = { name: string }
    type Value = { name: string }
    const mockFactory = defineFactory<Record<string, never>, Attrs, Value>(
      async (_deps, attrs) => {
        return {
          value: { name: attrs.name },
        }
      },
    )

    type CreateFnType = InferFixtureValue<typeof mockFactory.useCreateFn>
    expectTypeOf<CreateFnType>().toEqualTypeOf<
      (attrs: Attrs) => Promise<Value>
    >()
  })
})
