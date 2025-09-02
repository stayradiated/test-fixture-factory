import { describe, expectTypeOf, test } from 'vitest'

import type {
  FixturesOf,
  FlagOf,
  InputOf,
  OptionalInputKeysOf,
  OptionalOutputKeysOf,
  OutputOf,
  RequiredInputKeysOf,
  RequiredOutputKeysOf,
  ValueOf,
  VoidableInputOf,
} from './types.js'

import { createSchema } from './schema-utils.js'

describe('ValueOf<S, K>', () => {
  test('required fields', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>(),
    }))
    type Actual = ValueOf<typeof schema, 'name'>
    type Expected = string
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('optional fields', () => {
    const schema = createSchema().with((f) => ({
      id: f.type<number>().optional(),
    }))
    type Actual = ValueOf<typeof schema, 'id'>
    type Expected = number | undefined
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('OutputOf<S>', () => {
  test('empty schema', () => {
    const schema = createSchema().empty()
    type Actual = OutputOf<typeof schema>
    // biome-ignore lint/complexity/noBannedTypes: it is what it is
    type Expected = {}
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('required fields', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>(),
      age: f.type<number>(),
    }))
    type Actual = OutputOf<typeof schema>
    type Expected = {
      name: string
      age: number
    }
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('optional fields', () => {
    const schema = createSchema().with((f) => ({
      id: f.type<number>().optional(),
      address: f.type<string>().optional(),
    }))
    type Actual = OutputOf<typeof schema>
    type Expected = {
      id: number | undefined
      address: string | undefined
    }
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('FlagOf<S, K>', () => {
  test('required', () => {
    const schema = createSchema().with((f) => ({ name: f.type<string>() }))
    type Actual = FlagOf<typeof schema, 'name'>
    type Expected = 'required'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('optional', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>().optional(),
    }))
    type Actual = FlagOf<typeof schema, 'name'>
    type Expected = 'optional'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('FixturesOf<S, K>', () => {
  test('no dependencies', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>(),
    }))
    type Actual = FixturesOf<typeof schema, 'name'>
    type Expected = never
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('has dependencies', () => {
    const schema = createSchema<{ name?: string }>().with((f) => ({
      name: f.type<string>().dependsOn('name'),
    }))
    type Actual = FixturesOf<typeof schema, 'name'>
    type Expected = 'name'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('multiple dependencies', () => {
    const schema = createSchema<{ name?: string; age?: number }>().with(
      (f) => ({
        person: f.type<string>().dependsOn('name', 'age'),
      }),
    )
    type Actual = FixturesOf<typeof schema, 'person'>
    type Expected = 'name' | 'age'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('OptionalOutputKeysOf<S>', () => {
  test('no optional keys', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>(),
      age: f.type<number>(),
    }))
    type Actual = OptionalOutputKeysOf<typeof schema>
    type Expected = never
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('some optional keys', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>().optional(),
      age: f.type<number>(),
    }))
    type Actual = OptionalOutputKeysOf<typeof schema>
    type Expected = 'name'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('all optional keys', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>().optional(),
      age: f.type<number>().optional(),
    }))
    type Actual = OptionalOutputKeysOf<typeof schema>
    type Expected = 'name' | 'age'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('RequiredOutputKeysOf<S>', () => {
  test('no required keys', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>(),
      age: f.type<number>(),
    }))
    type Actual = RequiredOutputKeysOf<typeof schema>
    type Expected = 'name' | 'age'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('some required keys', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>(),
      age: f.type<number>().optional(),
    }))
    type Actual = RequiredOutputKeysOf<typeof schema>
    type Expected = 'name'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('has required keys', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>().optional(),
      age: f.type<number>().optional(),
    }))
    type Actual = RequiredOutputKeysOf<typeof schema>
    type Expected = never
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('OptionalInputKeysOf<S>', () => {
  test('no optional keys', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>(),
      age: f.type<number>(),
    }))
    type Actual = OptionalInputKeysOf<typeof schema>
    type Expected = never
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('keys marked as optional', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>().optional(),
      age: f.type<number>(),
    }))
    type Actual = OptionalInputKeysOf<typeof schema>
    type Expected = 'name'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('keys marked with default', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>().default('A. Nonymous'),
      age: f.type<number>(),
    }))
    type Actual = OptionalInputKeysOf<typeof schema>
    type Expected = 'name'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('keys using values from context', () => {
    const schema = createSchema<{ name?: string }>().with((f) => ({
      name: f
        .type<string>()
        .dependsOn('name')
        .use(({ name }) => name),
      age: f.type<number>(),
    }))
    type Actual = OptionalInputKeysOf<typeof schema>
    type Expected = 'name'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('RequiredInputKeysOf<S>', () => {
  test('all required keys', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>(),
      age: f.type<number>(),
    }))
    type Actual = RequiredInputKeysOf<typeof schema>
    type Expected = 'name' | 'age'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('some keys marked as optional', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>(),
      age: f.type<number>().optional(),
    }))
    type Actual = RequiredInputKeysOf<typeof schema>
    type Expected = 'name'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('some keys marked with default', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>().default('A. Nonymous'),
      age: f.type<number>(),
    }))
    type Actual = RequiredInputKeysOf<typeof schema>
    type Expected = 'age'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('some keys using values from context', () => {
    const schema = createSchema<{ name?: string }>().with((f) => ({
      name: f
        .type<string>()
        .dependsOn('name')
        .use(({ name }) => name),
      age: f.type<number>(),
    }))
    type Actual = RequiredInputKeysOf<typeof schema>
    type Expected = 'age'
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('InputOf<S>', () => {
  test('empty schema', () => {
    const schema = createSchema().empty()
    type Actual = InputOf<typeof schema>
    // biome-ignore lint/complexity/noBannedTypes: it is what it is
    type Expected = {}
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('single field', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>(),
    }))
    type Actual = InputOf<typeof schema>
    type Expected = {
      name: string
    }
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('mix of fields', () => {
    const schema = createSchema<{ c: 'c'; d?: 'd' }>().with((f) => ({
      a: f.type<'a'>(),
      b: f.type<'b'>().optional(),
      c: f
        .type<'c'>()
        .dependsOn('c')
        .use(({ c }) => c),
      d: f
        .type<'d'>()
        .dependsOn('d')
        .use(({ d }) => d)
        .optional(),
    }))
    type Actual = InputOf<typeof schema>
    type Expected = {
      a: 'a'
      b?: 'b' | undefined
      c?: 'c' | undefined
      d?: 'd' | undefined
    }
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('VoidableInputOf<S>', () => {
  test('some required fields', () => {
    const schema = createSchema().with((f) => ({
      name: f.type<string>(),
    }))
    type Actual = VoidableInputOf<typeof schema>
    type Expected = { name: string }
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('no fields', () => {
    const schema = createSchema().empty()
    type Actual = VoidableInputOf<typeof schema>
    // biome-ignore lint/complexity/noBannedTypes: it is what it is
    type Expected = {} | void
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('all optional fields', () => {
    const schema = createSchema().with((f) => ({
      id: f.type<number>().optional(),
    }))
    type Actual = VoidableInputOf<typeof schema>
    type Expected = { id?: number | undefined } | void
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('all default fields', () => {
    const schema = createSchema().with((f) => ({
      id: f.type<number>().default(1),
    }))
    type Actual = VoidableInputOf<typeof schema>
    type Expected = { id?: number | undefined } | void
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('all contextual fields', () => {
    const schema = createSchema<{ name: string }>().with((f) => ({
      name: f
        .type<string>()
        .dependsOn('name')
        .use(({ name }) => name),
    }))
    type Actual = VoidableInputOf<typeof schema>
    type Expected = { name?: string | undefined } | void
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})
