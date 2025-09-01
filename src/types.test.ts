import { describe, expectTypeOf, test } from 'vitest'
import { defineFactory } from './define-factory.js'
import { f } from './field-builder.js'
import type {
  AttrsOf,
  DepsOf,
  InferFixtureValue,
  InputAttrsOf,
} from './types.js'

describe('AttrsOf<S>', () => {
  test('empty schema', () => {
    const schema = {}
    type Actual = AttrsOf<typeof schema>
    // biome-ignore lint/complexity/noBannedTypes: it is what it is
    type Expected = {}
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('required fields', () => {
    const schema = {
      name: f.type<string>(),
      age: f.type<number>(),
    }
    type Actual = AttrsOf<typeof schema>
    type Expected = {
      name: string
      age: number
    }
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('optional fields', () => {
    const schema = {
      id: f.type<number>().optional(),
      address: f.type<string>().optional(),
    }
    type Actual = AttrsOf<typeof schema>
    type Expected = {
      id: number | undefined
      address: string | undefined
    }
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('DepsOf<S>', () => {
  test('empty schema', () => {
    const schema = {}
    type Actual = DepsOf<typeof schema>
    // biome-ignore lint/complexity/noBannedTypes: it is what it is
    type Expected = {}
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('attribute-only fields', () => {
    const schema = {
      name: f.type<string>(),
      age: f.type<number>().optional(),
    }
    type Actual = DepsOf<typeof schema>
    type Expected = object
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('dependent fields', () => {
    const schema = {
      id: f.type<number>().useContext(({ id }: { id: number }) => id),
      address: f
        .type<string>()
        .useContext(
          ({ user }: { user?: { address: string } }) => user?.address,
        ),
    }
    type Actual = DepsOf<typeof schema>
    type Expected = {
      id: number
      user?: { address: string }
    }
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('mix of fields', () => {
    const schema = {
      a: f.type<'a'>(),
      b: f.type<'b'>().optional(),
      c: f.type<'c'>().useContext(({ c }: { c: 'c' }) => c),
      d: f
        .type<'d'>()
        .useContext(({ d }: { d?: 'd' }) => d)
        .optional(),
    }
    type Actual = DepsOf<typeof schema>
    type Expected = {
      c: 'c'
      d?: 'd'
    }
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('InputAttrsOf<S>', () => {
  test('empty schema', () => {
    const schema = {}
    type Actual = InputAttrsOf<typeof schema>
    // biome-ignore lint/complexity/noBannedTypes: it is what it is
    type Expected = {}
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('mix of fields', () => {
    const schema = {
      a: f.type<'a'>(),
      b: f.type<'b'>().optional(),
      c: f.type<'c'>().useContext(({ c }: { c: 'c' }) => c),
      d: f
        .type<'d'>()
        .useContext(({ d }: { d?: 'd' }) => d)
        .optional(),
    }
    type Actual = InputAttrsOf<typeof schema>
    type Expected = {
      a: 'a'
      b?: 'b' | undefined
      c?: 'c' | undefined
      d?: 'd' | undefined
    }
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('InferFixtureValue', () => {
  const mockFactory = defineFactory(
    'MockFactory',
    {
      name: f.type<string>(),
    },
    async ({ name }) => {
      return {
        value: name,
      }
    },
  )

  test('infer value of useCreateFn', () => {
    type Actual = InferFixtureValue<typeof mockFactory.useCreateFn>
    type Expected = (
      attrs: void | Omit<{ name: string }, 'name'>,
    ) => Promise<string>

    expectTypeOf<Actual>().toEqualTypeOf<Expected>
  })

  test('infer value of useValueFn', () => {
    type Actual = InferFixtureValue<typeof mockFactory.useValueFn>
    type Expected = string

    expectTypeOf<Actual>().toEqualTypeOf<Expected>
  })
})
